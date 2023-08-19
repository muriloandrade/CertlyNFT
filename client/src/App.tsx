import {
  Container
} from '@mui/material';
import CertlyAppBar from "./components/CertlyAppBar";
import BasicTabs from "./components/Tabs";
import "./styles/Home.css";


export default function Home() {
  return (
    <Container fixed >

      <CertlyAppBar />

      <BasicTabs />


    </Container>
  );
}
