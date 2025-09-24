"use client";

import { 
  Avatar, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Typography 
} from "@mui/material";
import { 
  Dashboard as DashboardIcon, 
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserInfo {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    full_name?: string;
  };
}

export default function UserMenu() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserInfo(user);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDashboard = () => {
    handleClose();
    router.push('/dashboard');
  };

  const handleSignOut = async () => {
    handleClose();
    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = (): string => {
    if (!userInfo) return "User";
    
    return (
      userInfo.user_metadata?.full_name ||
      userInfo.user_metadata?.name ||
      userInfo.email?.split('@')[0] ||
      "User"
    );
  };

  const getUserInitials = (): string => {
    const name = getUserDisplayName();
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarSrc = (): string | undefined => {
    return userInfo?.user_metadata?.avatar_url;
  };

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ 
          ml: 1,
          border: open ? '2px solid rgba(144, 202, 249, 0.5)' : '2px solid transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            border: '2px solid rgba(144, 202, 249, 0.3)',
          }
        }}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32,
            background: 'linear-gradient(45deg, #90caf9, #64b5f6)',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
          src={getAvatarSrc()}
        >
          {getUserInitials()}
        </Avatar>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 200,
              background: 'rgba(16, 21, 28, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(144, 202, 249, 0.2)',
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'rgba(16, 21, 28, 0.95)',
                border: '1px solid rgba(144, 202, 249, 0.2)',
                borderBottom: 'none',
                borderRight: 'none',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              sx={{ 
                width: 40, 
                height: 40,
                background: 'linear-gradient(45deg, #90caf9, #64b5f6)',
                fontSize: '1rem',
                fontWeight: 600
              }}
              src={getAvatarSrc()}
            >
              {getUserInitials()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {getUserDisplayName()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userInfo?.email}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ borderColor: 'rgba(144, 202, 249, 0.2)' }} />
        
        {/* Menu Items */}
        <MenuItem 
          onClick={handleDashboard}
          sx={{ 
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(144, 202, 249, 0.1)',
            }
          }}
        >
          <ListItemIcon sx={{ color: '#90caf9' }}>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Dashboard" 
            secondary="View usage & stats"
            primaryTypographyProps={{ fontWeight: 500 }}
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            handleClose();
            router.push('/settings');
          }}
          sx={{ 
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(144, 202, 249, 0.1)',
            }
          }}
        >
          <ListItemIcon sx={{ color: '#90caf9' }}>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Settings" 
            secondary="Preferences & billing"
            primaryTypographyProps={{ fontWeight: 500 }}
            secondaryTypographyProps={{ fontSize: '0.75rem' }}
          />
        </MenuItem>
        
        <Divider sx={{ borderColor: 'rgba(144, 202, 249, 0.2)' }} />
        
        <MenuItem 
          onClick={handleSignOut}
          sx={{ 
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
            }
          }}
        >
          <ListItemIcon sx={{ color: '#f44336' }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Sign out" 
            primaryTypographyProps={{ fontWeight: 500, color: '#f44336' }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}
