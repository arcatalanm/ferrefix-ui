import { Routes, Route } from 'react-router-dom';
import Topbar from './components/Topbar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <>
      <Topbar />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
