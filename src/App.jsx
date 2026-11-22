import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { CalendarDays, ClipboardList, Coffee, Users } from 'lucide-react';
import { useMember } from './hooks/useMember.js';
import { useBreakBuddy } from './hooks/useBreakBuddy.js';
import { MemberPicker } from './components/MemberPicker.jsx';
import { TabBar } from './components/ui/TabBar.jsx';
import { TopBar } from './components/TopBar.jsx';
import { OrderPanel } from './components/OrderPanel.jsx';
import { TeamStatus } from './components/TeamStatus.jsx';
import { ShopSummary } from './components/ShopSummary.jsx';
import { HistoryView } from './components/HistoryView.jsx';
import { OfflineBanner } from './components/OfflineBanner.jsx';

export default function App() {
  const { member, setMember } = useMember();
  const [activeTab, setActiveTab] = useState('order');

  const {
    session,
    tally,
    menu,
    loading,
    myOrder,
    myStatus,
    placeOrder,
    cancelOrder,
  } = useBreakBuddy(member?._id);

  // Show member picker if no member selected
  if (!member) {
    return (
      <>
        <MemberPicker onSelect={setMember} />
        <Toaster position="top-center" toastOptions={{ error: { duration: 700 } }} />
      </>
    );
  }

  const tabs = [
    { id: 'order', label: 'Order', Icon: Coffee },
    // Team tab hidden for now (its panel below is untouched).
    // { id: 'team', label: 'Team', Icon: Users },
    { id: 'summary', label: 'Summary', Icon: ClipboardList },
    // History tab hidden for now (its panel below is untouched).
    // { id: 'history', label: 'History', Icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <Toaster
        position="top-center"
        toastOptions={{
          success: { duration: 700 },
          error: { duration: 700 },
          style: {
            background: 'var(--color-card)',
            color: 'var(--color-text)',
            borderRadius: '12px',
            fontFamily: 'var(--font-sans)',
          },
        }}
      />

      <div className="max-w-[480px] mx-auto px-5 pt-2">
        <TopBar
          member={member}
          onSwitchMember={() => setMember(null)}
        />
      </div>

      {/* Content */}
      <main className="max-w-[480px] mx-auto px-5 pt-[14px] pb-20">
        {activeTab === 'order' && (
          <OrderPanel
            menu={menu}
            session={session}
            members={tally?.members}
            currentMemberId={member._id}
            counts={tally?.counts}
            onOrder={placeOrder}
            onCancel={cancelOrder}
            loading={loading}
          />
        )}
        {activeTab === 'team' && (
          <div>
            <h2 className="text-xl text-ink mb-3">
              Team Status
            </h2>
            <TeamStatus members={tally?.members} loading={loading} />
          </div>
        )}
        {activeTab === 'summary' && (
          <div>
            <h2 className="text-xl text-ink mb-3">
              Shop Summary
            </h2>
            <ShopSummary tally={tally} session={session} loading={loading} />
          </div>
        )}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-xl text-ink mb-3">History</h2>
            <HistoryView />
          </div>
        )}
      </main>

      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <OfflineBanner />
    </div>
  );
}

