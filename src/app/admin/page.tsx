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
  Grid2 as Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Chat as ChatIcon,
  AccessTime as TimeIcon,
  Analytics as AnalyticsIcon
} from "@mui/icons-material";

interface ConversationSummary {
  id: string;
  user_id: string;
  title: string;
  duration_seconds: number;
  estimated_tokens: number;
  cost_cents: number;
  created_at: string;
}

interface UsageStats {
  totalConversations: number;
  totalUsers: number;
  totalDuration: number;
  totalTokens: number;
  totalCost: number;
  averageConversationLength: number;
  averageTokensPerConversation: number;
  conversations: ConversationSummary[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    try {
      const response = await fetch('/api/admin/usage-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to load usage stats');
      }
    } catch (error) {
      console.error('Error loading usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatCost = (costCents: number): string => {
    return `£${(costCents / 100).toFixed(4)}`;
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
              Loading Analytics...
            </Typography>
            <LinearProgress />
          </Box>
        </Box>
      </AuthGate>
    );
  }

  if (!stats) {
    return (
      <AuthGate>
        <Box sx={{ minHeight: "100vh", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" color="error">
            Failed to load usage statistics
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
            <AnalyticsIcon sx={{ mr: 2, color: '#90caf9' }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Admin Dashboard
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
            Usage Analytics
          </Typography>

          {/* Overview Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid xs={12} sm={6} md={4}>
              <StatCard
                title="Total Conversations"
                value={stats.totalConversations.toLocaleString()}
                subtitle="All time"
                icon={<ChatIcon sx={{ fontSize: 40 }} />}
                color="#90caf9"
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers.toLocaleString()}
                subtitle="Registered users"
                icon={<PeopleIcon sx={{ fontSize: 40 }} />}
                color="#4caf50"
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <StatCard
                title="Total Usage Time"
                value={formatDuration(stats.totalDuration)}
                subtitle="Conversation time"
                icon={<TimeIcon sx={{ fontSize: 40 }} />}
                color="#ff9800"
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <StatCard
                title="Total Tokens"
                value={stats.totalTokens.toLocaleString()}
                subtitle="Estimated consumption"
                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                color="#9c27b0"
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <StatCard
                title="Total Cost"
                value={formatCost(stats.totalCost)}
                subtitle="Estimated spend"
                icon={<MoneyIcon sx={{ fontSize: 40 }} />}
                color="#f44336"
              />
            </Grid>
            <Grid xs={12} sm={6} md={4}>
              <StatCard
                title="Avg Conversation"
                value={formatDuration(stats.averageConversationLength)}
                subtitle={`${Math.round(stats.averageTokensPerConversation)} tokens avg`}
                icon={<AnalyticsIcon sx={{ fontSize: 40 }} />}
                color="#00bcd4"
              />
            </Grid>
          </Grid>

          {/* Recent Conversations */}
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
                    {stats.conversations.slice(0, 10).map((conversation) => (
                      <TableRow key={conversation.id} hover>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {conversation.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            User: {conversation.user_id.slice(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={formatDuration(conversation.duration_seconds)}
                            size="small"
                            variant="outlined"
                            color={conversation.duration_seconds > 300 ? "warning" : "default"}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {conversation.estimated_tokens.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#4caf50">
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
            </Box>
          </Paper>
        </Container>
      </Box>
    </AuthGate>
  );
}
