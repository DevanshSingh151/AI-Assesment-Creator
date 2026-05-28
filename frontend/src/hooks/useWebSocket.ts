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
      setGenerationMessage('Assessment generated successfully!');
      setGenerationStatus('completed');
      try {
        const assignment = await getAssignment(data.assignmentId);
        setAssignment(assignment);
        addNotification({
          title: 'Generation Completed 🎉',
          message: `"${assignment.title}" is ready!`,
          link: `/assessment/${assignment._id}`,
        });
      } catch {
        addNotification({
          title: 'Generation Completed 🎉',
          message: 'Your assessment is ready!',
          link: `/assessment/${data.assignmentId}`,
        });
      }
    };

    const onFailed = (data: { error: string }) => {
      setGenerationMessage(data.error || 'Generation failed');
      setGenerationStatus('failed');
      addNotification({
        title: 'Generation Failed ⚠️',
        message: data.error || 'An assessment failed to generate.',
        link: '#',
      });
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
