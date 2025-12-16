import React from 'react';
import ActiveUsersKPI from './components/ActiveUsersKPI';
import MessagesPerDayChart from './components/MessagesPerDayChart';
import PeakChatHoursChart from './components/PeakChatHoursChart';

const Chat = () => (
  <div className="container py-4" style={{ background: '#fff', minHeight: '100vh' }}>
    <div className="text-center mb-4">
      <h1 className="mt-3 mb-2 fw-bold text-primary">Chat Analytics</h1>
      <p className="text-muted">Insights into chat activity and user engagement</p>
    </div>
    <div className="row g-4 justify-content-center mb-4">
      <ActiveUsersKPI />
    </div>
    <div className="row">
      <div className="col-12 col-lg-6">
        <MessagesPerDayChart />
      </div>
      <div className="col-12 col-lg-6">
        <PeakChatHoursChart />
      </div>
    </div>
  </div>
);

export default Chat; 