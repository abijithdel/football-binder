import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [socket, setSocket] = useState(null);
  const [auctionState, setAuctionState] = useState(null);
  const [timer, setTimer] = useState(30);
  const [lastBidNotification, setLastBidNotification] = useState(null);
  const [bidError, setBidError] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Play sound chime (using Web Audio API so no external sound files required)
  const playChime = useCallback((type = 'bid') => {
    if (typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'bid') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'win') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'hammer') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // AudioContext may be restricted by browser policy before first interaction
    }
  }, []);

  // Fetch logged in user
  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const [isSocketActive, setIsSocketActive] = useState(false);

  // Fetch auction state directly via REST
  const fetchAuctionState = async () => {
    try {
      const res = await fetch('/api/auction/state');
      const data = await res.json();
      if (res.ok && data.state) {
        setAuctionState(data.state);
        if (data.state.timer !== undefined) {
          setTimer(data.state.timer);
        }
      }
    } catch (e) {
      // silent
    }
  };

  // Initialize Socket.io connection or fallback gracefully
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || undefined;
    let s = null;

    try {
      s = io(socketUrl, {
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 5000,
        transports: ['websocket', 'polling'],
      });

      s.on('connect', () => {
        setIsSocketActive(true);
        console.log('⚡ Connected to Live Football Auction Socket');
      });

      s.on('connect_error', () => {
        setIsSocketActive(false);
      });

      s.on('disconnect', () => {
        setIsSocketActive(false);
      });

      s.on('auction:state_update', (state) => {
        setAuctionState(state);
        if (state && state.timer !== undefined) {
          setTimer(state.timer);
        }
      });

      s.on('auction:tick', (data) => {
        setTimer(data.timer);
      });

      s.on('auction:new_bid', (data) => {
        setLastBidNotification(data);
        playChime('bid');
        setTimeout(() => setLastBidNotification(null), 4000);
        fetchUser();
      });

      s.on('auction:player_started', () => {
        playChime('hammer');
      });

      s.on('auction:player_sold', () => {
        playChime('win');
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ffffff', '#aaaaaa', '#ffffff', '#222222'],
          });
        } catch (e) {}
        fetchUser();
      });

      s.on('auction:bid_error', (data) => {
        setBidError(data.message || 'Bid rejected');
        setTimeout(() => setBidError(''), 4000);
      });

      setSocket(s);
    } catch (err) {
      console.warn('Socket initialization skipped, operating in serverless mode');
    }

    // Initial state fetch
    fetchAuctionState();

    return () => {
      if (s) s.disconnect();
    };
  }, [playChime]);

  // Serverless Real-time Polling Loop (Essential for Vercel / Cloud deployments)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (!isSocketActive) {
        fetchAuctionState();
      }
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [isSocketActive]);

  // Client-side smooth timer countdown when live
  useEffect(() => {
    if (auctionState?.status !== 'live') return;

    const timerInt = setInterval(() => {
      setTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timerInt);
  }, [auctionState?.status]);

  // Place Bid action (Supports both WebSockets & Vercel HTTP API)
  const placeBid = async (amount) => {
    let managerId = user?.managerProfile?._id || user?.managerProfile;

    if (!managerId && user?.role === 'admin') {
      try {
        const res = await fetch('/api/managers');
        const data = await res.json();
        if (data.managers && data.managers.length > 0) {
          managerId = data.managers[0]._id;
        }
      } catch (e) {
        console.error('Error fetching admin fallback manager:', e);
      }
    }

    if (!managerId) {
      setBidError('Only assigned managers can place bids. Please log in as a manager.');
      setTimeout(() => setBidError(''), 4000);
      return;
    }
    setBidError('');

    const numAmount = Number(amount);
    const currentBudget = user?.managerProfile?.budget !== undefined ? user.managerProfile.budget : 1000;
    if (numAmount > currentBudget) {
      setBidError(`Insufficient Funds! Your balance is ₹${currentBudget.toLocaleString('en-IN')}, cannot bind for ₹${numAmount.toLocaleString('en-IN')}`);
      setTimeout(() => setBidError(''), 4000);
      return;
    }

    // Optimistically deduct the bound amount from manager funds
    setUser((prev) => {
      if (!prev || !prev.managerProfile) return prev;
      return {
        ...prev,
        managerProfile: {
          ...prev.managerProfile,
          budget: Math.max(0, (prev.managerProfile.budget || 1000) - numAmount),
        },
      };
    });

    if (socket && isSocketActive && socket.connected) {
      socket.emit('auction:place_bid', {
        managerId,
        amount: numAmount,
      });
    } else {
      // Vercel Serverless HTTP Fallback
      try {
        const res = await fetch('/api/auction/bid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ managerId, amount: numAmount }),
        });
        const data = await res.json();
        if (!res.ok) {
          setBidError(data.message || 'Bid rejected');
          setTimeout(() => setBidError(''), 4000);
        } else {
          if (data.auctionState) setAuctionState(data.auctionState);
          if (data.bid) setLastBidNotification({ bid: data.bid, currentBid: numAmount });
          playChime('bid');
          fetchUser();
        }
      } catch (err) {
        setBidError(err.message || 'Failed to submit bid');
        setTimeout(() => setBidError(''), 4000);
      }
    }
  };

  // Admin Actions (Supports both WebSockets & Vercel HTTP API)
  const executeAdminAction = async (actionPayload) => {
    if (socket && isSocketActive && socket.connected) {
      if (actionPayload.action === 'start') {
        socket.emit('admin:start_auction', { playerId: actionPayload.playerId, duration: actionPayload.duration });
      } else if (actionPayload.action === 'sell') {
        socket.emit('admin:sell_now');
      } else if (actionPayload.action === 'unsold') {
        socket.emit('admin:unsold_now');
      } else if (actionPayload.action === 'pause' || actionPayload.action === 'resume') {
        socket.emit('admin:toggle_pause');
      } else if (actionPayload.action === 'add_time') {
        socket.emit('admin:add_time', { seconds: actionPayload.seconds });
      } else if (actionPayload.action === 'reset') {
        socket.emit('admin:reset_auction');
      }
    } else {
      // Vercel Serverless HTTP Fallback
      try {
        const res = await fetch('/api/auction/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actionPayload),
        });
        const data = await res.json();
        if (data.auctionState) {
          setAuctionState(data.auctionState);
          if (data.auctionState.timer !== undefined) setTimer(data.auctionState.timer);
        }
      } catch (e) {
        console.error('Error executing admin action:', e);
      }
    }
  };

  const startAuction = (playerId, duration = 30) => {
    executeAdminAction({ action: 'start', playerId, duration });
  };

  const sellNow = () => {
    executeAdminAction({ action: 'sell' });
  };

  const unsoldNow = () => {
    executeAdminAction({ action: 'unsold' });
  };

  const togglePause = () => {
    executeAdminAction({ action: auctionState?.status === 'paused' ? 'resume' : 'pause' });
  };

  const addTime = (seconds = 15) => {
    executeAdminAction({ action: 'add_time', seconds });
  };

  const resetAuction = () => {
    executeAdminAction({ action: 'reset' });
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout');
      setUser(null);
      window.location.href = '/login';
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        loadingUser,
        fetchUser,
        socket,
        auctionState,
        timer,
        lastBidNotification,
        bidError,
        placeBid,
        startAuction,
        sellNow,
        unsoldNow,
        togglePause,
        addTime,
        resetAuction,
        logout,
        playChime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
