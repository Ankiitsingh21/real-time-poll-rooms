import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreatePoll from './pages/CreatePoll';
import PollRoom from './pages/PollRoom';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      {/* Animated background orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      <Routes>
        <Route path="/" element={<CreatePoll />} />
        <Route path="/poll/:pollId" element={<PollRoom />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
