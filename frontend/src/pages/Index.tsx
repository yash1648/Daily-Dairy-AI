
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  // Just redirect to root, since our app is a single page app
  useEffect(() => {
    navigate("/");
  }, [navigate]);

  return null;
};

export default Index;
