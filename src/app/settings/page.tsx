"use client";

import AuthGate from "@/components/AuthGate";
import UserMenu from "@/components/UserMenu";
import UpgradeModal from "@/components/UpgradeModal";
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
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Chip,
  LinearProgress
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { 
  Settings as SettingsIcon,
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
  Upgrade as UpgradeIcon
} from "@mui/icons-material";

interface UserSettings {
  plan_type: string;
  conversations_used: number;
  conversations_limit: number;
  stripe_customer_id?: string;
  subscription_status?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const loadUserSettings = useCallback(async () => {
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
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadLocalSettings = () => {
    const savedDebugMode = localStorage.getItem('jarvis_debug_mode') === 'true';
    const savedEmailNotifications = localStorage.getItem('jarvis_email_notifications') !== 'false';
    setDebugMode(savedDebugMode);
    setEmailNotifications(savedEmailNotifications);
  };

  useEffect(() => {
    loadUserSettings();
    loadLocalSettings();
  }, [loadUserSettings]);

  const handleSyncSubscription = useCallback(async () => {
    setSyncing(true);
    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const response = await fetch('/api/stripe/sync-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Sync result:', result);
        // Reload settings to show updated plan
        await loadUserSettings();
        alert('Subscription synced successfully!');
      } else {
        const error = await response.json();
        console.error('Sync error:', error);
        alert('Failed to sync subscription');
      }
    } catch (error) {
      console.error('Error syncing subscription:', error);
      alert('Failed to sync subscription');
    } finally {
      setSyncing(false);
    }
  }, [loadUserSettings]);

  const handleDebugModeChange = (enabled: boolean) => {
    setDebugMode(enabled);
    localStorage.setItem('jarvis_debug_mode', enabled.toString());
  };

  const handleEmailNotificationsChange = (enabled: boolean) => {
    setEmailNotifications(enabled);
    localStorage.setItem('jarvis_email_notifications', enabled.toString());
  };

  const handleBillingAction = async () => {
    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      if (settings?.plan_type === 'free') {
        // Show upgrade modal for free users
        setShowUpgradeModal(true);
      } else {
        // Open Stripe Customer Portal
        const response = await fetch('/api/stripe/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id }),
        });

        if (response.ok) {
          const { url } = await response.json();
          window.location.href = url;
        } else {
          const error = await response.json();
          if (error.needsSetup) {
            alert('Stripe Customer Portal needs configuration. Please contact support or try again later.');
          } else {
            alert('Failed to open billing portal. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error handling billing action:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const getPlanDisplayName = (planType: string): string => {
    const plans: Record<string, string> = {
      'free': 'Free Plan',
      'starter': 'Starter Plan',
      'pro': 'Pro Plan',
      'business': 'Business Plan'
    };
    return plans[planType] || planType;
  };

  const getPlanColor = (planType: string): string => {
    const colors: Record<string, string> = {
      'free': '#757575',
      'starter': '#4caf50',
      'pro': '#ff9800',
      'business': '#9c27b0'
    };
    return colors[planType] || '#757575';
  };

  const getUsagePercentage = (): number => {
    if (!settings) return 0;
    return (settings.conversations_used / settings.conversations_limit) * 100;
  };

  if (loading) {
    return (
      <AuthGate>
        <Box sx={{ minHeight: "100vh", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: 300 }}>
            <Typography variant="h6" gutterBottom textAlign="center">
              Loading Settings...
            </Typography>
            <LinearProgress />
          </Box>
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
            <SettingsIcon sx={{ mr: 2, color: '#90caf9' }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Settings
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
                onClick={() => router.push("/dashboard")}
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
                Dashboard
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
            Account Settings
          </Typography>

          <Grid container spacing={4}>
            {/* Account & Plan Section */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                background: 'rgba(16, 21, 28, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(144, 202, 249, 0.2)',
                p: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <AccountIcon sx={{ color: '#90caf9' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Account & Plan
                  </Typography>
                </Box>

                {settings && (
                  <Stack spacing={3}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Current Plan
                        </Typography>
                        <Chip 
                          label={getPlanDisplayName(settings.plan_type)}
                          sx={{ 
                            backgroundColor: getPlanColor(settings.plan_type),
                            color: 'white',
                            fontWeight: 600 
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {settings.conversations_used} of {settings.conversations_limit} conversations used this month
                      </Typography>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={getUsagePercentage()} 
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getPlanColor(settings.plan_type),
                            borderRadius: 4,
                          }
                        }}
                      />
                    </Box>

                    {settings.plan_type === 'free' && (
                      <Alert severity="info" sx={{ 
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        border: '1px solid rgba(33, 150, 243, 0.3)',
                        color: '#90caf9'
                      }}>
                        Upgrade to get more conversations and premium features!
                      </Alert>
                    )}

                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        startIcon={settings.plan_type === 'free' ? <UpgradeIcon /> : <CreditCardIcon />}
                        sx={{
                          background: "linear-gradient(45deg, #90caf9, #64b5f6)",
                          "&:hover": {
                            background: "linear-gradient(45deg, #64b5f6, #42a5f5)",
                          }
                        }}
                        onClick={handleBillingAction}
                      >
                        {settings.plan_type === 'free' ? 'Upgrade Plan' : 'Manage Billing'}
                      </Button>
                      
                      {settings.plan_type !== 'free' && (
                        <Button
                          variant="outlined"
                          onClick={() => setShowUpgradeModal(true)}
                          sx={{ 
                            borderColor: "rgba(144, 202, 249, 0.5)",
                            "&:hover": {
                              borderColor: "#90caf9",
                              background: "rgba(144, 202, 249, 0.1)"
                            }
                          }}
                        >
                          Change Plan
                        </Button>
                      )}
                    </Stack>

                    {/* Debug: Sync Subscription Button */}
                    <Button
                      variant="text"
                      onClick={handleSyncSubscription}
                      disabled={syncing}
                      sx={{ 
                        mt: 2,
                        color: "rgba(144, 202, 249, 0.7)",
                        fontSize: "0.8rem",
                        "&:hover": {
                          color: "#90caf9",
                          background: "rgba(144, 202, 249, 0.1)"
                        }
                      }}
                    >
                      {syncing ? 'Syncing...' : 'Sync Subscription'}
                    </Button>
                  </Stack>
                )}
              </Paper>
            </Grid>

            {/* App Preferences */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                background: 'rgba(16, 21, 28, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(144, 202, 249, 0.2)',
                p: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <SettingsIcon sx={{ color: '#90caf9' }} />
                  <Typography variant="h6" fontWeight={600}>
                    App Preferences
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={debugMode}
                        onChange={(e) => handleDebugModeChange(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          Debug Mode
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Show real-time usage metrics during conversations
                        </Typography>
                      </Box>
                    }
                  />

                  <Divider sx={{ borderColor: 'rgba(144, 202, 249, 0.2)' }} />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailNotifications}
                        onChange={(e) => handleEmailNotificationsChange(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          Email Notifications
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receive usage alerts and plan updates via email
                        </Typography>
                      </Box>
                    }
                  />
                </Stack>
              </Paper>
            </Grid>

            {/* Security & Privacy */}
            <Grid item xs={12}>
              <Paper sx={{ 
                background: 'rgba(16, 21, 28, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(144, 202, 249, 0.2)',
                p: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <SecurityIcon sx={{ color: '#90caf9' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Security & Privacy
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        borderRadius: 3,
                        textTransform: "none",
                        borderColor: "rgba(144, 202, 249, 0.5)",
                        py: 2,
                        "&:hover": {
                          borderColor: "#90caf9",
                          background: "rgba(144, 202, 249, 0.1)"
                        }
                      }}
                      onClick={() => {
                        // TODO: Implement data export
                        alert('Data export feature coming soon!');
                      }}
                    >
                      Export My Data
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        borderRadius: 3,
                        textTransform: "none",
                        borderColor: "rgba(255, 193, 7, 0.5)",
                        color: "#ffc107",
                        py: 2,
                        "&:hover": {
                          borderColor: "#ffc107",
                          background: "rgba(255, 193, 7, 0.1)"
                        }
                      }}
                      onClick={() => {
                        // TODO: Implement conversation deletion
                        alert('Clear conversations feature coming soon!');
                      }}
                    >
                      Clear All Conversations
                    </Button>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ 
                        borderRadius: 3,
                        textTransform: "none",
                        borderColor: "rgba(244, 67, 54, 0.5)",
                        color: "#f44336",
                        py: 2,
                        "&:hover": {
                          borderColor: "#f44336",
                          background: "rgba(244, 67, 54, 0.1)"
                        }
                      }}
                      onClick={() => {
                        // TODO: Implement account deletion
                        alert('Account deletion requires contacting support.');
                      }}
                    >
                      Delete Account
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>

        {/* Upgrade Modal */}
        <UpgradeModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={settings?.plan_type || 'free'}
        />
      </Box>
    </AuthGate>
  );
}
