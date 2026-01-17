import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'Flight of Ravens - DownStream',
  description: 'A surreal tale of disappearance, journey, and transformation at the end of the world. A DownStream visual story.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          id="ds-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function() {
  'use strict';
  var DS_ANALYTICS_ENDPOINT = 'https://analytics.downstream.ink';
  var DS_STREAM_ID = 'flight-of-ravens';
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
  var startTime = Date.now();
  var maxScrollDepth = 0;
  var milestonesSent = {};
  var currentSection = null;
  var sectionEnterTime = null;
  var eventQueue = [];
  var flushTimeout = null;
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
    eventQueue.push({
      type: type,
      timestamp: new Date().toISOString(),
      milestone: data.milestone,
      time_to_reach_ms: data.time_to_reach_ms,
      section_id: data.section_id,
      section_index: data.section_index,
      dwell_time_ms: data.dwell_time_ms,
      total_time_ms: data.total_time_ms,
      max_scroll_depth: data.max_scroll_depth
    });
    clearTimeout(flushTimeout);
    if (eventQueue.length >= 10) {
      flushEvents();
    } else {
      flushTimeout = setTimeout(flushEvents, 2000);
    }
  }
  function flushEvents() {
    if (eventQueue.length === 0) return;
    var events = eventQueue.splice(0);
    var payload = JSON.stringify({
      stream_id: DS_STREAM_ID,
      session_id: sessionId,
      visitor_id: visitorId,
      page_view_id: pageViewId,
      events: events
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(DS_ANALYTICS_ENDPOINT + '/events', payload);
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
    [25, 50, 75, 100].forEach(function(milestone) {
      if (scrollPct >= milestone && !milestonesSent[milestone]) {
        milestonesSent[milestone] = true;
        queueEvent('scroll_milestone', {
          milestone: milestone,
          time_to_reach_ms: Date.now() - startTime
        });
      }
    });
  }, 250);
  function handleSectionChange(sectionId, sectionIndex) {
    if (sectionId === currentSection) return;
    var now = Date.now();
    if (currentSection && sectionEnterTime) {
      queueEvent('section_exit', {
        section_id: currentSection,
        dwell_time_ms: now - sectionEnterTime
      });
    }
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
  function trackExit() {
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
    flushEvents();
  }
  function init() {
    trackPageView();
    setupSectionTracking();
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
