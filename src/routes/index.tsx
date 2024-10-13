import { useNavigate } from "@solidjs/router";

export default function Home() {
  const navigate = useNavigate();
  navigate("/table/list/question", { replace: true });
}
