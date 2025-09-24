"use client";

import AuthGate from "@/components/AuthGate";
import UserMenu from "@/components/UserMenu";
import { 
  AppBar, 
  Box, 
  Button, 
  Container, 
  Paper, 
  Stack, 
  Toolbar, 
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { 
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Chat as ChatIcon,
  AccessTime as TimeIcon,
  QueryStats as StatsIcon,
  Upgrade as UpgradeIcon
} from "@mui/icons-material";

interface UserUsage {
  conversations_used: number;
  conversations_limit: number;
  plan_type: string;
  total_duration: number;
  total_tokens: number;
  total_cost: number;
  recent_conversations: Array<{
    id: string;
    title: string;
    duration_seconds: number;
    estimated_tokens: number;
    cost_cents: number;
    created_at: string;
  }>;
}

export default function UserDashboard() {
  const router = useRouter();
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserUsage = useCallback(async () => {
    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/usage/user?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      } else {
        console.error('Failed to load user usage');
      }
    } catch (error) {
      console.error('Error loading user usage:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadUserUsage();
  }, [loadUserUsage]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatCost = (costCents: number): string => {
    return `£${(costCents / 100).toFixed(4)}`;
  };

  const getUsagePercentage = (): number => {
    if (!usage) return 0;
    return (usage.conversations_used / usage.conversations_limit) * 100;
  };

  const getUsageColor = (): string => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return "#f44336";
    if (percentage >= 70) return "#ff9800";
    return "#4caf50";
  };

  const getPlanDisplayName = (planType: string): string => {
    const plans: Record<string, string> = {
      'free': 'Free',
      'starter': 'Starter',
      'pro': 'Pro',
      'business': 'Business'
    };
    return plans[planType] || planType;
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    color = "#90caf9" 
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <Card sx={{ 
      background: 'rgba(16, 21, 28, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(144, 202, 249, 0.2)',
      height: '100%'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ color, fontWeight: 700 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AuthGate>
        <Box sx={{ minHeight: "100vh", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: 300 }}>
            <Typography variant="h6" gutterBottom textAlign="center">
              Loading Your Dashboard...
            </Typography>
            <LinearProgress />
          </Box>
        </Box>
      </AuthGate>
    );
  }

  if (!usage) {
    return (
      <AuthGate>
        <Box sx={{ minHeight: "100vh", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" color="error">
            Failed to load your usage data
          </Typography>
        </Box>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <Box className="gradient-bg" sx={{ minHeight: "100vh" }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ 
          background: "rgba(16, 21, 28, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(144, 202, 249, 0.2)"
        }}>
          <Toolbar>
            <StatsIcon sx={{ mr: 2, color: '#90caf9' }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Your Dashboard
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button 
                onClick={() => router.push("/")}
                variant="outlined"
                sx={{ 
                  borderRadius: 3,
                  textTransform: "none",
                  borderColor: "rgba(144, 202, 249, 0.5)",
                  "&:hover": {
                    borderColor: "#90caf9",
                    background: "rgba(144, 202, 249, 0.1)"
                  }
                }}
              >
                Home
              </Button>
              <Button 
                onClick={() => router.push("/call")}
                variant="contained"
                sx={{ 
                  borderRadius: 3,
                  textTransform: "none",
                  background: "linear-gradient(45deg, #90caf9, #64b5f6)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #64b5f6, #42a5f5)",
                  }
                }}
              >
                Start Call
              </Button>
              <UserMenu />
            </Stack>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography variant="h4" fontWeight={800} sx={{
            background: "linear-gradient(45deg, #90caf9, #64b5f6)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 4
          }}>
            Your Usage Dashboard
          </Typography>

          {/* Plan & Usage Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid
              size={{
                xs: 12,
                md: 8
              }}>
              <Paper sx={{ 
                background: 'rgba(16, 21, 28, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(144, 202, 249, 0.2)',
                p: 3
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Current Plan: {getPlanDisplayName(usage.plan_type)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {usage.conversations_used} of {usage.conversations_limit} conversations used this month
                    </Typography>
                  </Box>
                  {getUsagePercentage() > 80 && (
                    <Button
                      variant="contained"
                      startIcon={<UpgradeIcon />}
                      sx={{
                        background: "linear-gradient(45deg, #ff9800, #f57c00)",
                        "&:hover": {
                          background: "linear-gradient(45deg, #f57c00, #ef6c00)",
                        }
                      }}
                    >
                      Upgrade
                    </Button>
                  )}
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Usage this month</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {Math.round(getUsagePercentage())}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={getUsagePercentage()} 
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getUsageColor(),
                        borderRadius: 4,
                      }
                    }}
                  />
                </Box>

                {getUsagePercentage() > 90 && (
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    background: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    mt: 2
                  }}>
                    <Typography variant="body2" color="#f44336" fontWeight={600}>
                      ⚠️ Usage Limit Warning
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      You&apos;re almost at your monthly limit. Consider upgrading to continue using Jarvis.
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4
              }}>
              <StatCard
                title="Total Conversations"
                value={usage.conversations_used.toString()}
                subtitle="This month"
                icon={<ChatIcon sx={{ fontSize: 40 }} />}
                color="#90caf9"
              />
            </Grid>
          </Grid>

          {/* Usage Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3
              }}>
              <StatCard
                title="Total Talk Time"
                value={formatDuration(usage.total_duration)}
                subtitle="All conversations"
                icon={<TimeIcon sx={{ fontSize: 40 }} />}
                color="#4caf50"
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3
              }}>
              <StatCard
                title="Tokens Used"
                value={usage.total_tokens.toLocaleString()}
                subtitle="Estimated consumption"
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="#9c27b0"
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3
              }}>
              <StatCard
                title="Total Cost"
                value={formatCost(usage.total_cost)}
                subtitle="Service costs"
                icon={<MoneyIcon sx={{ fontSize: 40 }} />}
                color="#ff9800"
              />
            </Grid>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3
              }}>
              <StatCard
                title="Avg per Call"
                value={usage.conversations_used > 0 ? formatDuration(Math.round(usage.total_duration / usage.conversations_used)) : "0m"}
                subtitle={usage.conversations_used > 0 ? `${Math.round(usage.total_tokens / usage.conversations_used)} tokens` : "No calls yet"}
                icon={<StatsIcon sx={{ fontSize: 40 }} />}
                color="#00bcd4"
              />
            </Grid>
          </Grid>

          {/* Recent Conversations */}
          {usage.recent_conversations.length > 0 && (
            <Paper sx={{ 
              background: 'rgba(16, 21, 28, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(144, 202, 249, 0.2)',
            }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Recent Conversations
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Conversation</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Tokens</TableCell>
                        <TableCell>Cost</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usage.recent_conversations.slice(0, 5).map((conversation) => (
                        <TableRow 
                          key={conversation.id} 
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => router.push(`/history/${conversation.id}`)}
                        >
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {conversation.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={formatDuration(conversation.duration_seconds)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {conversation.estimated_tokens.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="#4caf50">
                              {formatCost(conversation.cost_cents)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption">
                              {new Date(conversation.created_at).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button 
                    onClick={() => router.push('/history')}
                    variant="outlined"
                    sx={{ 
                      borderRadius: 3,
                      textTransform: "none",
                      borderColor: "rgba(144, 202, 249, 0.5)",
                      "&:hover": {
                        borderColor: "#90caf9",
                        background: "rgba(144, 202, 249, 0.1)"
                      }
                    }}
                  >
                    View All Conversations
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
        </Container>
      </Box>
    </AuthGate>
  );
}
