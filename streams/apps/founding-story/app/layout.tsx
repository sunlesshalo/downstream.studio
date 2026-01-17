import './globals.css'
import Script from 'next/script'
import type { Metadata } from 'next'

// Determine base URL for metadata (og:image, etc.)
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  return 'https://downstream.ink'
}

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: 'The Vessel and the Sea',
  description: 'We all have a story to tell.',
  keywords: ['visual story', 'scroll-driven', 'animation', 'downstream'],
  openGraph: {
    title: 'The Vessel and the Sea',
    description: 'We all have a story to tell.',
    type: 'website',
    siteName: 'DownStream',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The Vessel and the Sea',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Vessel and the Sea',
    description: 'We all have a story to tell.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>

      </head>
      <body>

        {children}
        <Script
          id="ds-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `/**
 * DownStream Analytics Tracker
 * Lightweight tracking for scroll-driven stories
 *
 * Injected into generated stream apps.
 * Tracks: page views, scroll milestones, section engagement, completion.
 */
(function() {
  'use strict';

  // Configuration (replaced during build)
  var DS_ANALYTICS_ENDPOINT = 'https://analytics.downstream.ink';
  var DS_STREAM_ID = 'founding-story';

  // Skip if not configured
  if (DS_ANALYTICS_ENDPOINT.indexOf('__') === 0) {
    console.warn('[DS Analytics] Not configured');
    return;
  }

  // Skip bots - GDPR compliant (user agent is not PII)
  var ua = navigator.userAgent || '';
  if (/bot|crawler|spider|crawling|googlebot|bingbot|yandex|baidu|duckduck|slurp|ia_archiver|facebook|twitter|linkedin|pinterest|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|headless|phantomjs|puppet|selenium|dataprovider|prerender/i.test(ua)) {
    return;
  }

  // State
  var sessionId = generateUUID();
  var visitorId = getOrCreateVisitorId();
  var pageViewId = null;
  var pageViewIdReady = false;
  var startTime = Date.now();
  var maxScrollDepth = 0;
  var milestonesSent = {};
  var currentSection = null;
  var sectionEnterTime = null;
  var eventQueue = [];
  var flushTimeout = null;
  var pendingFlush = false;

  // Engagement tracking state
  var scrollSamples = [];
  var sectionVisits = {};  // {sectionId: visitCount}
  var summaryInterval = null;
  var summaryPeriod = 0;  // Which minute we're in
  var SUMMARY_INTERVAL_MS = 60000;  // Send summary every 60 seconds
  var PAUSE_THRESHOLD_MS = 1000;  // 1 second without scroll = pause

  // Generate UUID v4
  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Get or create persistent visitor ID
  function getOrCreateVisitorId() {
    try {
      var stored = localStorage.getItem('ds_vid');
      if (stored) return stored;
      var newId = generateUUID();
      localStorage.setItem('ds_vid', newId);
      return newId;
    } catch (e) {
      return generateUUID();
    }
  }

  // Detect device type
  function getDeviceType() {
    var ua = navigator.userAgent || '';
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  // Parse UTM parameters
  function getUtmParams() {
    try {
      var params = new URLSearchParams(window.location.search);
      return {
        source: params.get('utm_source'),
        medium: params.get('utm_medium'),
        campaign: params.get('utm_campaign')
      };
    } catch (e) {
      return { source: null, medium: null, campaign: null };
    }
  }

  // Throttle function
  function throttle(fn, ms) {
    var last = 0;
    return function() {
      var now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  // Queue event for batched sending
  function queueEvent(type, data) {
    var event = {
      type: type,
      timestamp: new Date().toISOString()
    };

    // Add fields based on event type
    if (data.milestone !== undefined) event.milestone = data.milestone;
    if (data.time_to_reach_ms !== undefined) event.time_to_reach_ms = data.time_to_reach_ms;
    if (data.section_id !== undefined) event.section_id = data.section_id;
    if (data.section_index !== undefined) event.section_index = data.section_index;
    if (data.dwell_time_ms !== undefined) event.dwell_time_ms = data.dwell_time_ms;
    if (data.total_time_ms !== undefined) event.total_time_ms = data.total_time_ms;
    if (data.max_scroll_depth !== undefined) event.max_scroll_depth = data.max_scroll_depth;

    // Engagement summary fields
    if (data.period !== undefined) event.period = data.period;
    if (data.reversals !== undefined) event.reversals = data.reversals;
    if (data.pause_points !== undefined) event.pause_points = data.pause_points;
    if (data.exit_depth_pct !== undefined) event.exit_depth_pct = data.exit_depth_pct;
    if (data.section_revisits !== undefined) event.section_revisits = data.section_revisits;
    if (data.total_scroll_distance !== undefined) event.total_scroll_distance = data.total_scroll_distance;
    if (data.min_depth_pct !== undefined) event.min_depth_pct = data.min_depth_pct;
    if (data.max_depth_pct !== undefined) event.max_depth_pct = data.max_depth_pct;

    eventQueue.push(event);

    // Flush after 2 seconds of inactivity or if queue has 10+ events
    clearTimeout(flushTimeout);
    if (eventQueue.length >= 10) {
      flushEvents();
    } else {
      flushTimeout = setTimeout(flushEvents, 2000);
    }
  }

  // Send queued events to backend
  function flushEvents(force) {
    if (eventQueue.length === 0) return;

    // Wait for page_view_id unless forcing (page unload)
    if (!pageViewIdReady && !force) {
      pendingFlush = true;
      return;
    }

    // If we still don't have a page_view_id, events will be dropped by server
    // This is unavoidable on very fast page exits
    var events = eventQueue.splice(0);
    var payload = JSON.stringify({
      stream_id: DS_STREAM_ID,
      session_id: sessionId,
      visitor_id: visitorId,
      page_view_id: pageViewId,
      events: events
    });

    // Use sendBeacon for reliability on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(DS_ANALYTICS_ENDPOINT + '/events', payload);
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', DS_ANALYTICS_ENDPOINT + '/events', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(payload);
    }
  }

  // Track page view on load
  function trackPageView() {
    var utm = getUtmParams();

    var payload = {
      stream_id: DS_STREAM_ID,
      session_id: sessionId,
      visitor_id: visitorId,
      referrer: document.referrer || null,
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
      screen_width: window.innerWidth,
      screen_height: window.innerHeight
    };

    var xhr = new XMLHttpRequest();
    xhr.open('POST', DS_ANALYTICS_ENDPOINT + '/pageview', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try {
          var response = JSON.parse(xhr.responseText);
          pageViewId = response.page_view_id;
          pageViewIdReady = true;
          // Flush any events that were waiting for the page_view_id
          if (pendingFlush) {
            pendingFlush = false;
            flushEvents();
          }
        } catch (e) {}
      }
    };
    xhr.send(JSON.stringify(payload));
  }

  // Track scroll progress (throttled)
  var trackScroll = throttle(function() {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    var scrollPct = Math.round((window.scrollY / docHeight) * 100);
    maxScrollDepth = Math.max(maxScrollDepth, scrollPct);

    // Sample scroll position for engagement analysis (lean - just timestamp and position)
    scrollSamples.push({t: Date.now(), y: window.scrollY, pct: scrollPct});

    // Fire milestone events at 25%, 50%, 75%, 100%
    [25, 50, 75, 100].forEach(function(milestone) {
      if (scrollPct >= milestone && !milestonesSent[milestone]) {
        milestonesSent[milestone] = true;
        queueEvent('scroll_milestone', {
          milestone: milestone,
          time_to_reach_ms: Date.now() - startTime
        });
      }
    });
  }, 200);  // Sample every 200ms for engagement tracking

  // Handle section visibility changes
  function handleSectionChange(sectionId, sectionIndex) {
    if (sectionId === currentSection) return;

    var now = Date.now();

    // Exit previous section
    if (currentSection && sectionEnterTime) {
      queueEvent('section_exit', {
        section_id: currentSection,
        dwell_time_ms: now - sectionEnterTime
      });
    }

    // Track section visits for revisit detection
    sectionVisits[sectionId] = (sectionVisits[sectionId] || 0) + 1;

    // Enter new section
    currentSection = sectionId;
    sectionEnterTime = now;
    queueEvent('section_enter', {
      section_id: sectionId,
      section_index: sectionIndex
    });
  }

  // Setup section tracking via scroll observation
  function setupSectionTracking() {
    var checkSections = throttle(function() {
      var sections = document.querySelectorAll('[data-section-id]');
      var viewportMid = window.innerHeight / 2;

      sections.forEach(function(section) {
        var rect = section.getBoundingClientRect();
        if (rect.top <= viewportMid && rect.bottom >= viewportMid) {
          var sectionId = section.getAttribute('data-section-id');
          var sectionIndex = parseInt(section.getAttribute('data-section-index') || '0', 10);
          handleSectionChange(sectionId, sectionIndex);
        }
      });
    }, 300);

    window.addEventListener('scroll', checkSections, { passive: true });

    // Initial check
    setTimeout(checkSections, 100);
  }

  // Calculate engagement summary from scroll samples
  function calculateEngagementSummary() {
    if (scrollSamples.length < 2) {
      return null;
    }

    var reversals = 0;
    var pausePoints = [];
    var totalDistance = 0;
    var lastDirection = 0;  // 1 = down, -1 = up, 0 = none
    var minDepth = 100;
    var maxDepth = 0;

    // Track pause detection
    var pauseStart = null;
    var pauseDepth = null;

    for (var i = 1; i < scrollSamples.length; i++) {
      var prev = scrollSamples[i - 1];
      var curr = scrollSamples[i];
      var deltaY = curr.y - prev.y;

      // Track min/max depth
      minDepth = Math.min(minDepth, curr.pct);
      maxDepth = Math.max(maxDepth, curr.pct);

      // Track total scroll distance (absolute)
      totalDistance += Math.abs(deltaY);

      // Detect direction changes (reversals)
      if (deltaY > 5) {  // Scrolling down (threshold to avoid noise)
        if (lastDirection === -1) reversals++;
        lastDirection = 1;
        pauseStart = null;  // Moving, not paused
      } else if (deltaY < -5) {  // Scrolling up
        if (lastDirection === 1) reversals++;
        lastDirection = -1;
        pauseStart = null;  // Moving, not paused
      } else {
        // Not moving significantly - potential pause
        if (pauseStart === null) {
          pauseStart = prev.t;
          pauseDepth = curr.pct;
        } else if (curr.t - pauseStart >= PAUSE_THRESHOLD_MS) {
          // Pause detected - record it (only once per pause)
          var existingPause = pausePoints.find(function(p) {
            return p.depth_pct === pauseDepth;
          });
          if (!existingPause) {
            pausePoints.push({
              depth_pct: pauseDepth,
              duration_ms: curr.t - pauseStart
            });
          } else {
            // Update duration if same position
            existingPause.duration_ms = curr.t - pauseStart;
          }
        }
      }
    }

    // Get section revisits (sections visited more than once)
    var revisits = {};
    for (var sectionId in sectionVisits) {
      if (sectionVisits[sectionId] > 1) {
        revisits[sectionId] = sectionVisits[sectionId];
      }
    }

    // Get exit depth (last sample)
    var exitDepth = scrollSamples[scrollSamples.length - 1].pct;

    return {
      period: summaryPeriod,
      reversals: reversals,
      pause_points: pausePoints.slice(0, 10),  // Limit to top 10
      exit_depth_pct: exitDepth,
      min_depth_pct: minDepth,
      max_depth_pct: maxDepth,
      total_scroll_distance: totalDistance,
      section_revisits: revisits
    };
  }

  // Send periodic engagement summary
  function sendEngagementSummary() {
    var summary = calculateEngagementSummary();
    if (summary) {
      queueEvent('engagement_summary', summary);
    }
    // Reset for next period
    scrollSamples = [];
    sectionVisits = {};
    summaryPeriod++;
  }

  // Track page exit
  function trackExit() {
    // Stop periodic summaries
    if (summaryInterval) {
      clearInterval(summaryInterval);
    }

    // Send final engagement summary
    var summary = calculateEngagementSummary();
    if (summary) {
      queueEvent('engagement_summary', summary);
    }
    // Final section exit
    if (currentSection && sectionEnterTime) {
      queueEvent('section_exit', {
        section_id: currentSection,
        dwell_time_ms: Date.now() - sectionEnterTime
      });
    }

    // Page exit event
    queueEvent('page_exit', {
      total_time_ms: Date.now() - startTime,
      max_scroll_depth: maxScrollDepth
    });

    // Force flush on page unload - best effort even without page_view_id
    flushEvents(true);
  }

  // Initialize
  function init() {
    trackPageView();
    setupSectionTracking();

    // Start periodic engagement summaries
    summaryInterval = setInterval(sendEngagementSummary, SUMMARY_INTERVAL_MS);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Scroll tracking
  window.addEventListener('scroll', trackScroll, { passive: true });

  // Exit tracking
  window.addEventListener('beforeunload', trackExit);
  window.addEventListener('pagehide', trackExit);

})();
`
          }}
        />
      
      </body>
    </html>
  )
}
