import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Layout from "@/components/layout";
import Home from "@/pages/home";
import Film from "@/pages/film";
import Anime from "@/pages/anime";
import Series from "@/pages/series";
import TvShow from "@/pages/tvshow";
import Genre from "@/pages/genre";
import GenreDetail from "@/pages/genre-detail";
import Schedule from "@/pages/schedule";
import Search from "@/pages/search";
import AnimeDetail from "@/pages/anime-detail";
import FilmDetail from "@/pages/film-detail";
import SeriesDetail from "@/pages/series-detail";
import Watch from "@/pages/watch";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/film" component={Film} />
        <Route path="/anime" component={Anime} />
        <Route path="/series" component={Series} />
        <Route path="/tvshow" component={TvShow} />
        <Route path="/genre" component={Genre} />
        <Route path="/genre/:slug" component={GenreDetail} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/search" component={Search} />
        <Route path="/anime/:slug" component={AnimeDetail} />
        <Route path="/film/:slug" component={FilmDetail} />
        <Route path="/series/:slug" component={SeriesDetail} />
        <Route path="/watch/:slug" component={Watch} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
