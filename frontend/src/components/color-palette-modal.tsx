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

// Meadow Green Palette (Patient Portal) - Clear light/dark separation
const greenPalette: ColorInfo[] = [
  {
    name: "Morning Mist",
    value: "#F8FBF7",
    description: "Lightest green - Page backgrounds",
  },
  {
    name: "Soft Meadow",
    value: "#EDF5E9",
    description: "Light green - Cards, containers",
  },
  {
    name: "Spring Dew",
    value: "#E0ECDB",
    description: "Subtle green - Borders, dividers",
  },
  {
    name: "Forest Green",
    value: "#6B9A65",
    description: "Medium forest - Primary buttons, links",
  },
  {
    name: "Deep Forest",
    value: "#4A7A44",
    description: "Dark forest - Text, emphasis",
  },
  {
    name: "Forest Shadow",
    value: "#2D5A29",
    description: "Darkest green - Headers, high contrast",
  },
];

// Rich Brown Palette (Staff Dashboard) - Clear light/dark separation
const terracottaPalette: ColorInfo[] = [
  {
    name: "Cream",
    value: "#FDF9F7",
    description: "Lightest cream - Page backgrounds",
  },
  {
    name: "Warm Sand",
    value: "#F5E8DF",
    description: "Light sand - Cards, containers",
  },
  {
    name: "Soft Beige",
    value: "#EDDCC7",
    description: "Subtle beige - Borders, dividers",
  },
  {
    name: "Rich Brown",
    value: "#A66B42",
    description: "Medium brown - Primary buttons, links",
  },
  {
    name: "Deep Mahogany",
    value: "#7A4A2E",
    description: "Dark mahogany - Text, emphasis",
  },
  {
    name: "Dark Chocolate",
    value: "#5D321A",
    description: "Darkest brown - Headers, high contrast",
  },
];

// Navy Blue Palette (Doctor Dashboard) - Clear light/dark separation
const bluePalette: ColorInfo[] = [
  {
    name: "Ice Blue",
    value: "#F7F9FC",
    description: "Lightest blue - Page backgrounds",
  },
  {
    name: "Pale Sky",
    value: "#EBF1F8",
    description: "Light blue - Cards, containers",
  },
  {
    name: "Soft Steel",
    value: "#D8E4F0",
    description: "Subtle blue - Borders, dividers",
  },
  {
    name: "Ocean Blue",
    value: "#5C7B9E",
    description: "Medium navy - Primary buttons, links",
  },
  {
    name: "Deep Navy",
    value: "#3D5A7A",
    description: "Dark navy - Text, emphasis",
  },
  {
    name: "Midnight Blue",
    value: "#243A56",
    description: "Darkest blue - Headers, high contrast",
  },
];

// Original Grayscale Palette (System Wide)
const grayscalePalette: ColorInfo[] = [
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              CarePulse Color Palette
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-8 mt-4">
            {/* Green Palette Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#2D5A29' }}>Patient Portal - Forest Meadow</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {greenPalette.map((color) => (
                  <div key={color.name} className="bg-white rounded-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-12 h-12 rounded-sm flex-shrink-0 border border-gray-200"
                        style={{ backgroundColor: color.value }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {color.name}
                        </h4>
                        <button
                          onClick={() => copyToClipboard(color.value)}
                          className="text-sm text-gray-600 font-mono hover:text-gray-900"
                        >
                          {color.value}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {color.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Terracotta Palette Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#5D321A' }}>Staff Dashboard - Rich Brown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {terracottaPalette.map((color) => (
                  <div key={color.name} className="bg-white rounded-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-12 h-12 rounded-sm flex-shrink-0 border border-gray-200"
                        style={{ backgroundColor: color.value }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {color.name}
                        </h4>
                        <button
                          onClick={() => copyToClipboard(color.value)}
                          className="text-sm text-gray-600 font-mono hover:text-gray-900"
                        >
                          {color.value}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {color.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Blue Palette Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#243A56' }}>Doctor Dashboard - Navy Blue</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bluePalette.map((color) => (
                  <div key={color.name} className="bg-white rounded-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-12 h-12 rounded-sm flex-shrink-0 border border-gray-200"
                        style={{ backgroundColor: color.value }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {color.name}
                        </h4>
                        <button
                          onClick={() => copyToClipboard(color.value)}
                          className="text-sm text-gray-600 font-mono hover:text-gray-900"
                        >
                          {color.value}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {color.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Grayscale Palette Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">System Wide - Grayscale</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grayscalePalette.map((color) => (
                  <div key={color.name} className="bg-white rounded-sm border border-gray-200 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-12 h-12 rounded-sm flex-shrink-0 border border-gray-200"
                        style={{ backgroundColor: color.value }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {color.name}
                        </h4>
                        <button
                          onClick={() => copyToClipboard(color.value)}
                          className="text-sm text-gray-600 font-mono hover:text-gray-900"
                        >
                          {color.value}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {color.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-sm border border-gray-200">
            <h3 className="font-semibold mb-2 text-gray-900">Usage Notes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Click on any hex value to copy it to clipboard</li>
              <li>• Forest Meadow palette: For patient portal pages and patient-focused features</li>
              <li>• Rich Brown palette: For staff dashboard and administrative interfaces</li>
              <li>• Navy Blue palette: For doctor dashboard and clinical tools</li>
              <li>• Grayscale: System-wide neutral colors for text and UI elements</li>
              <li>• All palettes are designed to be light and dreamy for a calming healthcare experience</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
