"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

interface ColorInfo {
  name: string;
  value: string;
  description: string;
}

const colorPalette: ColorInfo[] = [
  {
    name: "Black",
    value: "#000000",
    description: "Black - Main accent, headers, primary text",
  },
  {
    name: "Dark Gray",
    value: "#333333",
    description: "Dark Gray - Body text, main content",
  },
  {
    name: "Gray",
    value: "#666666",
    description: "Gray - Secondary text, icons",
  },
  {
    name: "Light Gray",
    value: "#999999",
    description: "Light Gray - Muted text, placeholders",
  },
  {
    name: "Lighter Gray",
    value: "#CCCCCC",
    description: "Lighter Gray - Subtle elements",
  },
  {
    name: "Lightest Gray",
    value: "#F5F5F5",
    description: "Lightest Gray - Card backgrounds, surfaces",
  },
  {
    name: "White",
    value: "#FFFFFF",
    description: "White - Main background, contrast",
  },
  {
    name: "Off White",
    value: "#FAFAFA",
    description: "Off White - Alternate backgrounds",
  },
  {
    name: "Medium Gray",
    value: "#808080",
    description: "Medium Gray - Neutral elements",
  },
  {
    name: "Slate",
    value: "#4A4A4A",
    description: "Slate - Subtle emphasis",
  },
];

export const ColorPaletteModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-white"
      >
        <Palette className="h-4 w-4 mr-2" />
        Colors
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              CarePulse Color Palette
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {colorPalette.map((color) => (
              <div key={color.name} className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-md flex-shrink-0"
                    style={{ backgroundColor: color.value }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">
                      {color.name}
                    </h3>
                    <button
                      onClick={() => copyToClipboard(color.value)}
                      className="text-sm text-muted-foreground text-foreground font-mono"
                    >
                      {color.value}
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {color.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Usage Notes:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Click on any hex value to copy it to clipboard</li>
              <li>
                • Colors are defined as CSS custom properties in globals.css
              </li>
              <li>
                • Use semantic color names (primary, secondary, accent) for
                consistency
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
