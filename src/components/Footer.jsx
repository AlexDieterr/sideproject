import { Link } from "react-router-dom";
import "../styles/Footer.css"; // Make sure this file exists

const Footer = () => {
  return (
    <footer className="footer">
      <Link to="/legal">TOS</Link>
      <Link to="/legal">Privacy</Link>
      <Link to="/legal">Legal</Link>
      <Link to="/legal">Contact</Link>
    </footer>
  );
};

export default Footer;