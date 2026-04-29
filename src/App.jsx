import { AppProvider } from './context/AppContext';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import LSTMSection from './components/LSTMSection';
import AttentionSection from './components/AttentionSection';
import ComparisonSection from './components/ComparisonSection';
import WalkthroughSection from './components/WalkthroughSection';
import PlaygroundSection from './components/PlaygroundSection';
import GameSection from './components/GameSection';
import QuizSection from './components/QuizSection';
import TakeawaysSection from './components/TakeawaysSection';
import './App.css';

function App() {
  return (
    <AppProvider>
      <div className="app">
        <Navigation />
        <main>
          <HeroSection />
          <LSTMSection />
          <AttentionSection />
          <ComparisonSection />
          <WalkthroughSection />
          <PlaygroundSection />
          <GameSection />
          <QuizSection />
          <TakeawaysSection />
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
