import { useNavigate } from "@solidjs/router";

export default function Home() {
  const navigate = useNavigate();
  navigate("/home-page", { replace: true });
}
