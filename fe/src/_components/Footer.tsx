import { Mic } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="container mx-auto px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Mic className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">
            Karaoke<span className="text-primary">Now</span>
          </span>
        </div>
        <p className="max-w-md text-sm text-muted-foreground">
          Find, compare, and book the best karaoke rooms in your city. Your perfect night out starts here.
        </p>
        <p className="text-xs text-muted-foreground">
          © 2026 KaraokeNow. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
