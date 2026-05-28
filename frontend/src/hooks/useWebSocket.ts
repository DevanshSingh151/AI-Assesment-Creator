'use client';

import { useEffect, useRef, useState } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { getAssignment } from '@/lib/api';

export function useWebSocket(assignmentId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const { setGenerationStatus, setGenerationMessage, setAssignment, addNotification } = useAssessmentStore();
  const joinedRoom = useRef<string | null>(null);

  useEffect(() => {
    if (!assignmentId) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    const handleCompleted = async (id: string) => {
      setGenerationMessage('Assessment generated successfully!');
      setGenerationStatus('completed');
      try {
        const assignment = await getAssignment(id);
        if (!isMounted) return;
        setAssignment(assignment);
        addNotification({
          title: 'Generation Completed 🎉',
          message: `"${assignment.title}" is ready!`,
          link: `/assessment/${assignment._id}`,
        });
      } catch {
        if (!isMounted) return;
        addNotification({
          title: 'Generation Completed 🎉',
          message: 'Your assessment is ready!',
          link: `/assessment/${id}`,
        });
      }
    };

    const handleFailed = (errorMsg: string) => {
      setGenerationMessage(errorMsg || 'Generation failed');
      setGenerationStatus('failed');
      addNotification({
        title: 'Generation Failed ⚠️',
        message: errorMsg || 'An assessment failed to generate.',
        link: '#',
      });
    };

    const checkStatus = async () => {
      try {
        const assignment = await getAssignment(assignmentId);
        if (!isMounted) return false;

        if (assignment.status === 'completed') {
          if (pollInterval) clearInterval(pollInterval);
          await handleCompleted(assignmentId);
          return true;
        } else if (assignment.status === 'failed') {
          if (pollInterval) clearInterval(pollInterval);
          handleFailed(assignment.error || 'Generation failed');
          return true;
        } else if (assignment.status === 'processing') {
          setGenerationMessage('Generating questions with AI...');
          setGenerationStatus('processing');
        }
      } catch (error) {
        console.error('Error fetching assignment status:', error);
      }
      return false;
    };

    // Run initial check immediately
    checkStatus();

    // Start polling fallback
    pollInterval = setInterval(async () => {
      const isDone = await checkStatus();
      if (isDone && pollInterval) {
        clearInterval(pollInterval);
      }
    }, 3000);

    const socket = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      if (assignmentId && joinedRoom.current !== assignmentId) {
        socket.emit('join:assignment', assignmentId);
        joinedRoom.current = assignmentId;
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
      joinedRoom.current = null;
    };

    const onProgress = (data: { message: string; step?: number }) => {
      setGenerationMessage(data.message);
      setGenerationStatus('processing');
    };

    const onCompleted = async (data: { assignmentId: string }) => {
      if (pollInterval) clearInterval(pollInterval);
      await handleCompleted(data.assignmentId);
    };

    const onFailed = (data: { error: string }) => {
      if (pollInterval) clearInterval(pollInterval);
      handleFailed(data.error);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('generation:progress', onProgress);
    socket.on('generation:completed', onCompleted);
    socket.on('generation:failed', onFailed);

    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);

      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('generation:progress', onProgress);
      socket.off('generation:completed', onCompleted);
      socket.off('generation:failed', onFailed);

      if (joinedRoom.current) {
        socket.emit('leave', joinedRoom.current);
        joinedRoom.current = null;
      }

      disconnectSocket();
    };
  }, [assignmentId, setGenerationStatus, setGenerationMessage, setAssignment]);

  return { isConnected };
}
