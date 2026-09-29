import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './components/Home';
import ProjectDetail from './components/ProjectDetail';
import { BrowserRouter, Routes, Route } from 'react-router';
import Container from '@mui/material/Container';

  const theme = createTheme({
    typography: {
      fontFamily: '"roboto"',
    },
  });

function App() {


  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <section id="center">
          <BrowserRouter>
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
          </Routes>
        </Container>
      </BrowserRouter>
        </section>
      </ThemeProvider>
    </>
  )
}

export default App
