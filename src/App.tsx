import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChocolateProvider } from './context/ChocolateContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AddReviewPage from './pages/AddReviewPage';
import CollectionPage from './pages/CollectionPage';
import DetailPage from './pages/DetailPage';
import StatsPage from './pages/StatsPage';

export default function App() {
  return (
    <BrowserRouter>
      <ChocolateProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="add" element={<AddReviewPage />} />
            <Route path="collection" element={<CollectionPage />} />
            <Route path="detail/:id" element={<DetailPage />} />
            <Route path="stats" element={<StatsPage />} />
          </Route>
        </Routes>
      </ChocolateProvider>
    </BrowserRouter>
  );
}
