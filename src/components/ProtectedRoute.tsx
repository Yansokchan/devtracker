import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  user,
  children,
}: {
  user: any;
  children: JSX.Element;
}) {
  if (!user) {
    // Redirect to home (login will show if not authenticated)
    return <Navigate to="/" replace />;
  }
  return children;
}
