import type { Metadata } from 'next'
import { streamConfig } from '../config'
import './globals.css'

export const metadata: Metadata = {
  title: streamConfig.title || 'DownStream',
  description: 'A scroll-driven visual story',
  openGraph: {
    title: streamConfig.title || 'DownStream',
    description: 'A scroll-driven visual story',
    type: 'website',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* DownStream Analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var DS_ANALYTICS_ENDPOINT = 'https://analytics.downstream.ink';
                var DS_STREAM_ID = 'bolyai';
                var sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
                var visitorId = localStorage.getItem('ds_vid') || (function() { var id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2); localStorage.setItem('ds_vid', id); return id; })();
                
                function send(type, data) {
                  fetch(DS_ANALYTICS_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      stream_id: DS_STREAM_ID,
                      session_id: sessionId,
                      visitor_id: visitorId,
                      event_type: type,
                      data: data,
                      url: window.location.href,
                      referrer: document.referrer,
                      timestamp: new Date().toISOString()
                    })
                  }).catch(function() {});
                }
                
                send('page_view', { title: document.title });
                
                var maxScroll = 0;
                var milestones = [25, 50, 75, 100];
                var reported = {};
                
                window.addEventListener('scroll', function() {
                  var scrollPct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
                  if (scrollPct > maxScroll) {
                    maxScroll = scrollPct;
                    milestones.forEach(function(m) {
                      if (scrollPct >= m && !reported[m]) {
                        reported[m] = true;
                        send('scroll_milestone', { percent: m });
                      }
                    });
                  }
                });
              })();
            `
          }}
        />
      </head>
      <body style={{ overscrollBehavior: 'none' }}>{children}</body>
    </html>
  )
}
