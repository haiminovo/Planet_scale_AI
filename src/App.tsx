import "./App.scss";
import { useWeb3React } from "@web3-react/core";
import Card from "./components/Card";
import { useEffect, useState } from "react";
import { detectPhantomMultiChainProvider } from "./utils";
import { PhantomInjectedProvider } from "./types";
import { customFetch } from "./utils/fetchUtil";
import { Layout, Menu, Button, message } from 'antd';
const { Header, Content, Footer } = Layout;
interface IInfo{
  icon:string,
  title:string,
  message:string[],

}
const infoArr:IInfo[]=[
  {
    icon:'',
    title:'How It Works',
    message:['Key features: Privacy-preserving, blockchain-powered, secure execution environment for AI.']
  },
  {
    icon:'',
    title:'Benefits',
    message:['Sections for each key benefit (e.g., Enhanced Privacy, Data Integrity, Scalability).','Use bullet points for clearer readability.','Include icons or images to accompany each benefit for visual appeal.']
  },
  {
    icon:'',
    title:'AI-FHE Demos',
    message:["Showcase of available demos.","Brief description of each demo and what it demonstrates about your platform's capabilities.","CTA to try a demo: 'Experience the Demo'"]
  },
];

function App() {
  const anyWindow:any =window;
  const { connector, hooks } = useWeb3React();
  const [provider, setProvider] = useState<PhantomInjectedProvider | null>(null);
  const [currentPubkey,setCurrentPubkey]=useState("");
  const [banlance,setBalance] = useState();

  const items = new Array(5).fill(null).map((_, index) => ({
    key: index + 1,
    label: `nav ${index + 1}`,
  }));

  const initProvider=async ()=>{
    const phantomMultiChainProvider = await detectPhantomMultiChainProvider();
    setProvider(phantomMultiChainProvider);
  }

  useEffect(() => {
    initProvider();
  }, []);

  const initConnect=async (solana: { connect: (arg0: { onlyIfTrusted: boolean; }) => any; } | undefined)=>{
    const solanaPubKey = await solana?.connect({ onlyIfTrusted: true });
    const pubKeyRes=solanaPubKey?.publicKey?.toString();
    setCurrentPubkey(pubKeyRes);
  };

  useEffect(()=>{
    initConnect(provider?.solana);
  },[provider])

  const getBalance=async ()=>{
    try {
      const resp = await customFetch('https://api.devnet.solana.com','POST',{
        "jsonrpc": "2.0", 
        "id": 1,
        "method": "getBalance",
        "params": [
          currentPubkey
        ]
      });
      setBalance(resp.result.value);
    } catch(err) {
      // error message
    }
  };
  useEffect(()=>{
    if(currentPubkey){
      getBalance();
    }
  },[currentPubkey]);

  return (
    <Layout className="layout">
      <Header className="layout__header">
      <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['0']}
          items={items}
        />
      </Header>
      <Content className="layout__content">
      {/* <div className="card">
        <Card connector={connector} hooks={hooks} name='phantom' />
        当前账户余额：{banlance}
      </div> */}
      <div className="container">
        <div className="main">
          <div className="subPage1">
            <p className="headLine">Planet-scale AI </p>
            <p className="headLine">Powered by Solana & FHE</p>
            <p className="subLine">Empower your AI with privacy-preserving technology<br/> powered by Web3 and FHE (Fully homomorphic encryption).</p>
            <div className="buttonBox">
              <Button className="button">Discover How</Button>
              <Button className="button">Watch Demo</Button>
            </div>
          </div>
          <div className="info">
            {infoArr.map((item)=>{
              return  (
              <div className="info__item">
                <p style={{fontSize:18,fontWeight:'bold'}}>{item.title}</p>
                {item.message.map((desc)=>{
                  return <p>{desc}</p>
                })}
              </div>
              )
            })}
            </div>
        </div>
        <div className="main">

        </div>
      </div>

      </Content>
      <Footer className="layout__footer">

      </Footer>
    </Layout>
  );
}

export default App;