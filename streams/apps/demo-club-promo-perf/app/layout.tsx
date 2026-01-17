import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'NEON NIGHTS - DownStream',
  description: 'A DownStream visual story',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Telegram Mini App SDK */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {children}
        {/* Telegram initialization */}
        <Script
          id="telegram-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {
  var tg = window.Telegram && window.Telegram.WebApp;
  if (tg && tg.initData) {
    console.log('[Telegram] Mini App detected');
    tg.ready();
    tg.expand();
    if (tg.themeParams) {
      var root = document.documentElement;
      Object.keys(tg.themeParams).forEach(function(key) {
        root.style.setProperty('--tg-theme-' + key.replace(/_/g, '-'), tg.themeParams[key]);
      });
    }
  }
})();`
          }}
        />
        {/* Analytics */}
        <Script
          id="ds-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {
  'use strict';
  var DS_ANALYTICS_ENDPOINT = 'https://analytics.downstream.ink';
  var DS_STREAM_ID = 'demo-club-promo-perf';
  if (DS_ANALYTICS_ENDPOINT.indexOf('__') === 0) {
    console.warn('[DS Analytics] Not configured');
    return;
  }
  var ua = navigator.userAgent || '';
  if (/bot|crawler|spider|crawling|googlebot|bingbot|yandex|baidu|duckduck|slurp|ia_archiver|facebook|twitter|linkedin|pinterest|semrush|ahrefs|mj12bot|dotbot|petalbot|bytespider|headless|phantomjs|puppet|selenium|dataprovider|prerender/i.test(ua)) {
    return;
  }
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
  var scrollSamples = [];
  var sectionVisits = {};  
  var summaryInterval = null;
  var summaryPeriod = 0;  
  var SUMMARY_INTERVAL_MS = 60000;  
  var PAUSE_THRESHOLD_MS = 1000;  
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
  function getDeviceType() {
    var ua = navigator.userAgent || '';
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
  }
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
  function queueEvent(type, data) {
    var event = {
      type: type,
      timestamp: new Date().toISOString()
    };
    if (data.milestone !== undefined) event.milestone = data.milestone;
    if (data.time_to_reach_ms !== undefined) event.time_to_reach_ms = data.time_to_reach_ms;
    if (data.section_id !== undefined) event.section_id = data.section_id;
    if (data.section_index !== undefined) event.section_index = data.section_index;
    if (data.dwell_time_ms !== undefined) event.dwell_time_ms = data.dwell_time_ms;
    if (data.total_time_ms !== undefined) event.total_time_ms = data.total_time_ms;
    if (data.max_scroll_depth !== undefined) event.max_scroll_depth = data.max_scroll_depth;
    if (data.period !== undefined) event.period = data.period;
    if (data.reversals !== undefined) event.reversals = data.reversals;
    if (data.pause_points !== undefined) event.pause_points = data.pause_points;
    if (data.exit_depth_pct !== undefined) event.exit_depth_pct = data.exit_depth_pct;
    if (data.section_revisits !== undefined) event.section_revisits = data.section_revisits;
    if (data.total_scroll_distance !== undefined) event.total_scroll_distance = data.total_scroll_distance;
    if (data.min_depth_pct !== undefined) event.min_depth_pct = data.min_depth_pct;
    if (data.max_depth_pct !== undefined) event.max_depth_pct = data.max_depth_pct;
    eventQueue.push(event);
    clearTimeout(flushTimeout);
    if (eventQueue.length >= 10) {
      flushEvents();
    } else {
      flushTimeout = setTimeout(flushEvents, 2000);
    }
  }
  function flushEvents(force) {
    if (eventQueue.length === 0) return;
    if (!pageViewIdReady && !force) {
      pendingFlush = true;
      return;
    }
    var events = eventQueue.splice(0);
    var payload = JSON.stringify({
      stream_id: DS_STREAM_ID,
      session_id: sessionId,
      visitor_id: visitorId,
      page_view_id: pageViewId,
      events: events
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(DS_ANALYTICS_ENDPOINT + '/events', new Blob([payload], {type: 'application/json'}));
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', DS_ANALYTICS_ENDPOINT + '/events', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(payload);
    }
  }
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
          if (pendingFlush) {
            pendingFlush = false;
            flushEvents();
          }
        } catch (e) {}
      }
    };
    xhr.send(JSON.stringify(payload));
  }
  var trackScroll = throttle(function() {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var scrollPct = Math.round((window.scrollY / docHeight) * 100);
    maxScrollDepth = Math.max(maxScrollDepth, scrollPct);
    scrollSamples.push({t: Date.now(), y: window.scrollY, pct: scrollPct});
    [25, 50, 75, 100].forEach(function(milestone) {
      if (scrollPct >= milestone && !milestonesSent[milestone]) {
        milestonesSent[milestone] = true;
        queueEvent('scroll_milestone', {
          milestone: milestone,
          time_to_reach_ms: Date.now() - startTime
        });
      }
    });
  }, 200);  
  function handleSectionChange(sectionId, sectionIndex) {
    if (sectionId === currentSection) return;
    var now = Date.now();
    if (currentSection && sectionEnterTime) {
      queueEvent('section_exit', {
        section_id: currentSection,
        dwell_time_ms: now - sectionEnterTime
      });
    }
    sectionVisits[sectionId] = (sectionVisits[sectionId] || 0) + 1;
    currentSection = sectionId;
    sectionEnterTime = now;
    queueEvent('section_enter', {
      section_id: sectionId,
      section_index: sectionIndex
    });
  }
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
    setTimeout(checkSections, 100);
  }
  function calculateEngagementSummary() {
    if (scrollSamples.length < 2) {
      return null;
    }
    var reversals = 0;
    var pausePoints = [];
    var totalDistance = 0;
    var lastDirection = 0;  
    var minDepth = 100;
    var maxDepth = 0;
    var pauseStart = null;
    var pauseDepth = null;
    for (var i = 1; i < scrollSamples.length; i++) {
      var prev = scrollSamples[i - 1];
      var curr = scrollSamples[i];
      var deltaY = curr.y - prev.y;
      minDepth = Math.min(minDepth, curr.pct);
      maxDepth = Math.max(maxDepth, curr.pct);
      totalDistance += Math.abs(deltaY);
      if (deltaY > 5) {  
        if (lastDirection === -1) reversals++;
        lastDirection = 1;
        pauseStart = null;  
      } else if (deltaY < -5) {  
        if (lastDirection === 1) reversals++;
        lastDirection = -1;
        pauseStart = null;  
      } else {
        if (pauseStart === null) {
          pauseStart = prev.t;
          pauseDepth = curr.pct;
        } else if (curr.t - pauseStart >= PAUSE_THRESHOLD_MS) {
          var existingPause = pausePoints.find(function(p) {
            return p.depth_pct === pauseDepth;
          });
          if (!existingPause) {
            pausePoints.push({
              depth_pct: pauseDepth,
              duration_ms: curr.t - pauseStart
            });
          } else {
            existingPause.duration_ms = curr.t - pauseStart;
          }
        }
      }
    }
    var revisits = {};
    for (var sectionId in sectionVisits) {
      if (sectionVisits[sectionId] > 1) {
        revisits[sectionId] = sectionVisits[sectionId];
      }
    }
    var exitDepth = scrollSamples[scrollSamples.length - 1].pct;
    return {
      period: summaryPeriod,
      reversals: reversals,
      pause_points: pausePoints.slice(0, 10),  
      exit_depth_pct: exitDepth,
      min_depth_pct: minDepth,
      max_depth_pct: maxDepth,
      total_scroll_distance: totalDistance,
      section_revisits: revisits
    };
  }
  function sendEngagementSummary() {
    var summary = calculateEngagementSummary();
    if (summary) {
      queueEvent('engagement_summary', summary);
    }
    scrollSamples = [];
    sectionVisits = {};
    summaryPeriod++;
  }
  function trackExit() {
    if (summaryInterval) {
      clearInterval(summaryInterval);
    }
    var summary = calculateEngagementSummary();
    if (summary) {
      queueEvent('engagement_summary', summary);
    }
    if (currentSection && sectionEnterTime) {
      queueEvent('section_exit', {
        section_id: currentSection,
        dwell_time_ms: Date.now() - sectionEnterTime
      });
    }
    queueEvent('page_exit', {
      total_time_ms: Date.now() - startTime,
      max_scroll_depth: maxScrollDepth
    });
    flushEvents(true);
  }
  function init() {
    trackPageView();
    setupSectionTracking();
    summaryInterval = setInterval(sendEngagementSummary, SUMMARY_INTERVAL_MS);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('scroll', trackScroll, { passive: true });
  window.addEventListener('beforeunload', trackExit);
  window.addEventListener('pagehide', trackExit);
})();`
          }}
        />
      </body>
    </html>
  )
}
