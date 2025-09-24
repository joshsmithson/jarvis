"use client";

import { useCallback, useRef, useState, useEffect } from 'react';

interface ConversationMetrics {
  duration_seconds: number;
  user_speech_duration: number;
  ai_speech_duration: number;
  estimated_tokens: number;
  message_count: number;
  user_message_count: number;
  ai_message_count: number;
}

interface UsageEvent {
  type: 'user_speech_start' | 'user_speech_end' | 'ai_speech_start' | 'ai_speech_end' | 'message_received';
  timestamp: number;
  data?: {
    duration_ms?: number;
    content?: string;
    tokens?: number;
  };
}

export function useConversationTracking() {
  const [isDebugMode, setIsDebugMode] = useState(false);

  // Load debug mode from localStorage on mount
  useEffect(() => {
    const savedDebugMode = localStorage.getItem('jarvis_debug_mode') === 'true';
    setIsDebugMode(savedDebugMode);
  }, []);
  const [currentMetrics, setCurrentMetrics] = useState<ConversationMetrics>({
    duration_seconds: 0,
    user_speech_duration: 0,
    ai_speech_duration: 0,
    estimated_tokens: 0,
    message_count: 0,
    user_message_count: 0,
    ai_message_count: 0,
  });

  // Refs for tracking timing
  const conversationStartTime = useRef<number>(0);
  const userSpeechStartTime = useRef<number>(0);
  const aiSpeechStartTime = useRef<number>(0);
  const userSpeechTotal = useRef<number>(0);
  const aiSpeechTotal = useRef<number>(0);
  const eventsLog = useRef<UsageEvent[]>([]);

  const logEvent = useCallback((event: UsageEvent) => {
    eventsLog.current.push(event);
    if (isDebugMode) {
      console.log('📊 Usage Event:', event);
    }
  }, [isDebugMode]);

  const estimateTokensFromText = useCallback((text: string): number => {
    // Simple estimation: ~4 characters per token (conservative)
    // This is for OpenAI-style tokenization, ElevenLabs might be different
    return Math.ceil(text.length / 4);
  }, []);

  // const estimateTokensFromDuration = useCallback((durationMs: number): number => {
  //   // Rough estimate: ~2-3 tokens per second of speech
  //   // This will need calibration with real data
  //   const seconds = durationMs / 1000;
  //   return Math.ceil(seconds * 2.5);
  // }, []);

  const startConversation = useCallback(() => {
    const now = Date.now();
    conversationStartTime.current = now;
    userSpeechTotal.current = 0;
    aiSpeechTotal.current = 0;
    eventsLog.current = [];
    
    setCurrentMetrics({
      duration_seconds: 0,
      user_speech_duration: 0,
      ai_speech_duration: 0,
      estimated_tokens: 0,
      message_count: 0,
      user_message_count: 0,
      ai_message_count: 0,
    });

    logEvent({ type: 'user_speech_start', timestamp: now });
  }, [logEvent]);

  const handleUserSpeechStart = useCallback(() => {
    userSpeechStartTime.current = Date.now();
    logEvent({ type: 'user_speech_start', timestamp: Date.now() });
  }, [logEvent]);

  const handleUserSpeechEnd = useCallback(() => {
    const now = Date.now();
    const duration = now - userSpeechStartTime.current;
    userSpeechTotal.current += duration;
    
    logEvent({ 
      type: 'user_speech_end', 
      timestamp: now, 
      data: { duration_ms: duration } 
    });
  }, [logEvent]);

  const handleAiSpeechStart = useCallback(() => {
    aiSpeechStartTime.current = Date.now();
    logEvent({ type: 'ai_speech_start', timestamp: Date.now() });
  }, [logEvent]);

  const handleAiSpeechEnd = useCallback(() => {
    const now = Date.now();
    const duration = now - aiSpeechStartTime.current;
    aiSpeechTotal.current += duration;
    
    logEvent({ 
      type: 'ai_speech_end', 
      timestamp: now, 
      data: { duration_ms: duration } 
    });
  }, [logEvent]);

  const handleMessage = useCallback((message: {
    message?: string;
    content?: string;
    text?: string;
  }, isUser: boolean) => {
    const content = message.message || message.content || message.text || '';
    const tokenEstimate = estimateTokensFromText(content);
    
    setCurrentMetrics(prev => ({
      ...prev,
      message_count: prev.message_count + 1,
      user_message_count: isUser ? prev.user_message_count + 1 : prev.user_message_count,
      ai_message_count: !isUser ? prev.ai_message_count + 1 : prev.ai_message_count,
      estimated_tokens: prev.estimated_tokens + tokenEstimate,
    }));

    logEvent({ 
      type: 'message_received', 
      timestamp: Date.now(), 
      data: { 
        content, 
        isUser, 
        length: content.length, 
        estimated_tokens: tokenEstimate 
      } 
    });
  }, [estimateTokensFromText, logEvent]);

  const updateRealTimeMetrics = useCallback(() => {
    if (conversationStartTime.current === 0) return;

    const now = Date.now();
    const totalDuration = Math.floor((now - conversationStartTime.current) / 1000);
    const userSpeechDuration = Math.floor(userSpeechTotal.current / 1000);
    const aiSpeechDuration = Math.floor(aiSpeechTotal.current / 1000);

    setCurrentMetrics(prev => ({
      ...prev,
      duration_seconds: totalDuration,
      user_speech_duration: userSpeechDuration,
      ai_speech_duration: aiSpeechDuration,
    }));
  }, []);

  const endConversation = useCallback((): ConversationMetrics => {
    updateRealTimeMetrics();
    
    const finalMetrics = {
      ...currentMetrics,
      duration_seconds: Math.floor((Date.now() - conversationStartTime.current) / 1000),
      user_speech_duration: Math.floor(userSpeechTotal.current / 1000),
      ai_speech_duration: Math.floor(aiSpeechTotal.current / 1000),
    };

    if (isDebugMode) {
      console.log('📊 Final Conversation Metrics:', finalMetrics);
      console.log('📊 Events Log:', eventsLog.current);
    }

    return finalMetrics;
  }, [currentMetrics, updateRealTimeMetrics, isDebugMode]);

  const getEstimatedCost = useCallback((metrics: ConversationMetrics): number => {
    // Your cost: £20/month for 100,000 tokens = £0.0002 per token
    const costPerToken = 0.0002;
    return metrics.estimated_tokens * costPerToken;
  }, []);

  const setDebugMode = useCallback((enabled: boolean) => {
    setIsDebugMode(enabled);
    localStorage.setItem('jarvis_debug_mode', enabled.toString());
  }, []);

  return {
    isDebugMode,
    setIsDebugMode: setDebugMode,
    currentMetrics,
    startConversation,
    endConversation,
    handleUserSpeechStart,
    handleUserSpeechEnd,
    handleAiSpeechStart,
    handleAiSpeechEnd,
    handleMessage,
    updateRealTimeMetrics,
    getEstimatedCost,
    eventsLog: eventsLog.current,
  };
}
