import { Link } from 'react-router-dom';

function AuthRouteLink({ to, children, className = 'textLink' }) {
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

export default AuthRouteLink;
