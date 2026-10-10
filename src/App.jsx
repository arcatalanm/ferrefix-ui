import { Routes, Route } from 'react-router-dom';
import Topbar from './components/Topbar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Arriendos from './pages/Arriendos';
import Footer from './components/Footer';
import './index.css';

function App() {
  return (
    <>
      <Topbar />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/arriendos" element={<Arriendos />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
