"use client";

import { 
  Box, 
  Paper, 
  Typography, 
  Switch, 
  FormControlLabel, 
  Grid, 
  Chip,
  Divider,
  IconButton,
  Collapse
} from "@mui/material";
import { 
  BugReport as BugIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from "@mui/icons-material";
import { useState } from "react";

interface ConversationMetrics {
  duration_seconds: number;
  user_speech_duration: number;
  ai_speech_duration: number;
  estimated_tokens: number;
  message_count: number;
  user_message_count: number;
  ai_message_count: number;
}

interface DebugPanelProps {
  isDebugMode: boolean;
  onDebugModeChange: (enabled: boolean) => void;
  metrics: ConversationMetrics;
  estimatedCost: number;
  isConversationActive: boolean;
}

export default function DebugPanel({ 
  isDebugMode, 
  onDebugModeChange, 
  metrics, 
  estimatedCost,
  isConversationActive 
}: DebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCost = (cost: number): string => {
    return `£${cost.toFixed(4)}`;
  };

  return (
    <Paper 
      elevation={3}
      sx={{ 
        position: 'fixed',
        top: 16,
        right: 16,
        minWidth: 300,
        maxWidth: 400,
        background: 'rgba(16, 21, 28, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(144, 202, 249, 0.2)',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BugIcon sx={{ color: '#90caf9', fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Debug Panel
          </Typography>
          <Chip 
            label={isConversationActive ? "LIVE" : "IDLE"} 
            size="small"
            color={isConversationActive ? "success" : "default"}
            variant="outlined"
          />
        </Box>
        <IconButton 
          size="small" 
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ color: '#90caf9' }}
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Toggle */}
      <Box sx={{ px: 2, pb: isExpanded ? 0 : 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isDebugMode}
              onChange={(e) => onDebugModeChange(e.target.checked)}
              size="small"
            />
          }
          label="Enable Debug Mode"
          sx={{ m: 0 }}
        />
      </Box>

      {/* Detailed metrics when expanded */}
      <Collapse in={isExpanded}>
        <Divider sx={{ mx: 2, borderColor: 'rgba(144, 202, 249, 0.2)' }} />
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {/* Duration Metrics */}
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Duration Metrics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Duration:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDuration(metrics.duration_seconds)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">User Speaking:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDuration(metrics.user_speech_duration)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">AI Speaking:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatDuration(metrics.ai_speech_duration)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Message Metrics */}
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Message Metrics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Messages:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {metrics.message_count}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">User Messages:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {metrics.user_message_count}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">AI Messages:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {metrics.ai_message_count}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Usage & Cost */}
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Usage & Cost
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Estimated Tokens:</Typography>
                  <Typography variant="body2" fontWeight={600} color="#90caf9">
                    {metrics.estimated_tokens.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Estimated Cost:</Typography>
                  <Typography variant="body2" fontWeight={600} color="#4caf50">
                    {formatCost(estimatedCost)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Cost per Token:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    £0.0002
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Live indicators */}
            {isConversationActive && (
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: 'rgba(76, 175, 80, 0.1)',
                  border: '1px solid rgba(76, 175, 80, 0.3)'
                }}>
                  <Typography variant="caption" color="#4caf50" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: '#4caf50',
                      animation: 'pulse 1s infinite'
                    }} />
                    Live tracking active
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
}



