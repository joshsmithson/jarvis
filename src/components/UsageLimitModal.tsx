"use client";

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  Stack
} from '@mui/material';
import { Warning, Upgrade } from '@mui/icons-material';

interface UsageLimitModalProps {
  open: boolean;
  onClose: () => void;
  conversationsUsed: number;
  conversationsLimit: number;
  planType: string;
  onUpgrade: () => void;
}

const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  open,
  onClose,
  conversationsUsed,
  conversationsLimit,
  planType,
  onUpgrade
}) => {
  const usagePercentage = (conversationsUsed / conversationsLimit) * 100;
  const isAtLimit = conversationsUsed >= conversationsLimit;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(16, 21, 28, 0.95) 0%, rgba(30, 40, 50, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(144, 202, 249, 0.2)'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
          <Warning color={isAtLimit ? "error" : "warning"} />
          <Typography variant="h5" fontWeight={700}>
            {isAtLimit ? 'Usage Limit Reached' : 'Usage Warning'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Alert 
            severity={isAtLimit ? "error" : "warning"}
            sx={{ 
              borderRadius: 2,
              background: isAtLimit 
                ? 'rgba(244, 67, 54, 0.1)' 
                : 'rgba(255, 152, 0, 0.1)',
              border: isAtLimit 
                ? '1px solid rgba(244, 67, 54, 0.3)' 
                : '1px solid rgba(255, 152, 0, 0.3)'
            }}
          >
            {isAtLimit 
              ? `You've reached your monthly limit of ${conversationsLimit} conversations on the ${planType} plan.`
              : `You're close to your monthly limit! You've used ${conversationsUsed} of ${conversationsLimit} conversations on the ${planType} plan.`
            }
          </Alert>

          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Conversations Used
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {conversationsUsed} / {conversationsLimit}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(usagePercentage, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: usagePercentage >= 100 
                    ? 'linear-gradient(45deg, #f44336, #e53935)'
                    : usagePercentage >= 80
                    ? 'linear-gradient(45deg, #ff9800, #f57c00)'
                    : 'linear-gradient(45deg, #4caf50, #388e3c)',
                  borderRadius: 4
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {usagePercentage.toFixed(1)}% of monthly limit used
            </Typography>
          </Box>

          <Box 
            sx={{ 
              p: 3,
              borderRadius: 2,
              background: 'rgba(144, 202, 249, 0.05)',
              border: '1px solid rgba(144, 202, 249, 0.2)'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: '#90caf9' }}>
              Need More Conversations?
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upgrade your plan to get more conversations, longer session durations, and priority processing.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Starter Plan: 50 conversations/month
              • Pro Plan: 200 conversations/month
              • Business Plan: 1000 conversations/month
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          {isAtLimit ? 'Close' : 'Continue'}
        </Button>
        <Button
          onClick={onUpgrade}
          variant="contained"
          startIcon={<Upgrade />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            background: 'linear-gradient(45deg, #90caf9, #64b5f6)',
            '&:hover': {
              background: 'linear-gradient(45deg, #64b5f6, #42a5f5)',
            }
          }}
        >
          Upgrade Plan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UsageLimitModal;
