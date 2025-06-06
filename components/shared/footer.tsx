export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-center">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Pizzazzle. All rights reserved.
        </p>
      </div>
    </footer>
  );
}