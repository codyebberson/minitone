import './App.css';
import { KnobInput } from './KnobInput';
import { audioPlayer } from './player';

function App() {
  return (
    <div className="App">
      <KnobInput min={0} max={1} initial={0.5} onChange={(volume) => (audioPlayer.volume = volume)} />
    </div>
  );
}

export default App;
