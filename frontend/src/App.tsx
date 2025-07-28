import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotesProvider } from "@/contexts/NotesContext";
import { CommandPaletteProvider } from "@/contexts/CommandPaletteContext";
import MainLayout from "@/layouts/MainLayout";
import NotFound from "./pages/NotFound";
import { LoginPaletteProvider } from "@/contexts/LoginPaletteContext"; // Import the LoginPaletteProvider
import { LoginPalette } from "@/components/LoginPalette";
import {AlertProvider} from "@/contexts/AlertContext.tsx";

const queryClient = new QueryClient();

const App = () => {
  return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AlertProvider>
          <NotesProvider>

            <CommandPaletteProvider>
              <LoginPaletteProvider> {/* Wrap with LoginPaletteProvider */}
                <TooltipProvider>
                  <Toaster />
                  <Sonner />

                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<MainLayout />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>

                  <LoginPalette  />
                </TooltipProvider>
              </LoginPaletteProvider>
            </CommandPaletteProvider>
          </NotesProvider>
          </AlertProvider>

        </ThemeProvider>
      </QueryClientProvider>
  );
};

export default App;
