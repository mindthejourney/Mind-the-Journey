export default function Footer() {
  return (
    <footer className="w-full text-center py-6 mt-10 border-t border-gray-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-10">
        <div>
          <h4 className="font-bold">Navigation</h4>
          <ul>
            <li>Home</li>
            <li>Themes</li>
            <li>Map</li>
            <li>Blog</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold">About</h4>
          <ul>
            <li>The Project</li>
            <li>Editorial Team</li>
            <li>Collaborations</li>
            <li>Contacts</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold">Legal</h4>
          <ul>
            <li>Privacy Policy</li>
            <li>Terms of Use</li>
            <li>Cookie Policy</li>
            <li>Accessibility</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold">Connect</h4>
          <p>Follow us:</p>
          <div className="flex justify-center gap-3 mt-2">
            <a href="#">IG</a>
            <a href="#">YT</a>
            <a href="#">TT</a>
            <a href="#">SP</a>
          </div>
        </div>
      </div>
      <div className="text-xs mt-6">
        © 2025 Mind the Journey · All rights reserved
      </div>
    </footer>
  );
}
