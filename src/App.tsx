import "./App.scss";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import { detectPhantomMultiChainProvider } from "./utils";
import { PhantomInjectedProvider } from "./types";
import { customFetch } from "./utils/commonUtils/fetchUtil";
import { Layout, Menu, Button, message, Spin, Tooltip } from 'antd';
import { animated } from '@react-spring/web'
import { PublicKey } from '@solana/web3.js';
const { Header, Content, Footer } = Layout;
import {
  LoadingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { FadeInAnimation, ShuttleAnimation } from "./utils/commonUtils/reactSpringUtil";

interface IInfo {
  icon: string,
  title: string,
  message: string[],

}
const infoArr: IInfo[] = [
  {
    icon: '',
    title: 'How It Works',
    message: ['Privacy-Preserving: Encrypts data for secure AI processing, ensuring confidentiality.', 'Blockchain-Powered: Decentralized ledger secures and logs AI data transactions.', 'Secure Execution Environment: Isolates AI tasks in a protected, secure space.']
  },
  {
    icon: '',
    title: 'Benefits',
    message: ['Protects sensitive information using robust encryption and strict controls.', 'Rigorously maintains data with high accuracy and consistency standards', 'Empowers operational expansion and enhances scalability of workloads.']
  },
  {
    icon: '',
    title: 'About AI-FHE',
    message: ["Developers can create proprietary designs using homomorphic encryption.", "Utilizes Zama's open source framework for development.", "Enables applications such as image filtering and sentiment analysis.", "Ensures user data privacy remains intact."]
  },
];

function App() {
  const anyWindow: any = window;
  const { connector, hooks } = useWeb3React();
  const [provider, setProvider] = useState<PhantomInjectedProvider | null>(null);
  const [currentPubkey, setCurrentPubkey] = useState("");
  const [banlance, setBalance] = useState();
  const [connectLoading, setConnectLoading] = useState(false);

  const HandleNavMenuClick = (item: any) => {
    console.log(item);
    switch (+item.key) {
      case 1: handleWalletConnect(); return;
      case 2: handleWalletConnect(); return;
    }
  }

  const handleWalletConnect = () => {
    setConnectLoading(true);
    initProvider().then((res) => {
      if (!res) {
        message.error('Please install related plug-ins first', 5);
        window.open('https://phantom.app/', '_blank');
        return;
      }
      initConnect(res?.solana).then(async (res) => {
        if (!res) {
          message.error('Failed to connect wallet!', 5);
          return;
        }
      }).finally(() => {
        setConnectLoading(false);
      });
    })
  }

  const initProvider = async () => {
    const phantomMultiChainProvider = await detectPhantomMultiChainProvider();
    setProvider(phantomMultiChainProvider);
    if (!phantomMultiChainProvider?.solana) {
      return false;
    }
    console.log('init Provider success!');
    return phantomMultiChainProvider;
  }

  const initConnect = async (solana: { connect: (arg0: { onlyIfTrusted: boolean; }) => any; } | undefined) => {
    const solanaPubKey = await solana?.connect({ onlyIfTrusted: true });
    const pubKeyRes = solanaPubKey?.publicKey?.toString();
    if (!pubKeyRes) {
      return false;
    }
    setCurrentPubkey(pubKeyRes);
    return true;
  };

  const getBalance = async () => {
    try {
      const resp = await customFetch('https://api.devnet.solana.com', 'POST', {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [
          currentPubkey
        ]
      });
      const balanceVal = resp.result.value;
      setBalance(balanceVal);
      return balanceVal;
    } catch (err) {
      // error message
    }
  };

  useEffect(() => {
    if (currentPubkey) {
      getBalance().then((res) => {
        console.log('init Wallet Connect success!');
        console.log('balance is ' + res);

      });

    }
  }, [currentPubkey]);

  return (
    <Layout className="layout">
      <div>
        <Header className="layout__header">
          <img className="logo" src="src/assets/vivaai_light.png" alt="viva ai" />
          {/* <p className="name">
            ViVA AI
          </p> */}
          <Menu
            className="navMenu"
            theme="dark"
            mode="horizontal"
            onClick={HandleNavMenuClick}
            selectable={false}
          >
            <Menu.Item key={0}>Contact</Menu.Item>
            {(!banlance && banlance !== 0) ? (
              <Menu.Item key={1} disabled={connectLoading}>Wallet Connect</Menu.Item>
            ) : (
              <Menu.Item key={2}>
                <div className="accountInfo">
                  <Tooltip title={'Click to refresh the balance'} trigger={'hover'}>
                    <div>
                      Wallet Balance：{banlance}
                    </div>
                  </Tooltip>
                </div>
              </Menu.Item>
            )}
          </Menu>
          <Spin style={{ width: 14, right: 0 }} spinning={connectLoading} size="small" />
        </Header>
      </div>
      <Content className="layout__content">
        <div className="container">
          <div className="main">
            <animated.div className="subPage1" style={{ ...FadeInAnimation() }}>
              <p className="headLine">Planet-scale AI </p>
              <p className="headLine">Powered by Solana & FHE</p>
              <p className="subLine">Empower your AI with privacy-preserving technology<br /> powered by Web3 and FHE (Fully homomorphic encryption).</p>
              <div className="buttonBox">
                <Button className="button">Discover How</Button>
                <Button className="button">Watch Demo</Button>
              </div>
            </animated.div>
            <div className="info">
              {infoArr.map((item, index) => {

                return (
                  <animated.ul className="info__item" style={{ ...ShuttleAnimation('x', -index * 500 - 1920, 0, (index + 1) * 400) }} key={index}>
                    <p style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</p>
                    {item.message.map((desc, subIndex) => {
                      return <li style={{ lineHeight: '16px', margin: '8px 0 8px 16px' }} key={subIndex}>{desc}</li>
                    })}
                  </animated.ul>
                )
              })}
            </div>
          </div>
          <div className="main">

          </div>
          <div className="main">
            <div className="subPage2">
              <div className="aboutUs">
                <div className="header">
                  <img className="logo" src="src/assets/vivaai_dark.png" alt="viva ai" />
                  <h1 className="title">About Us</h1>
                </div>
                <p className="desc">
                  Welcome to the future of privacy-preserving AI, where privacy meets innovation, powered by the revolutionary integration of Solana, Web3 and blockchain technologies. Our platform is designed to revolutionize the way data is utilized in the AI realm, offering an unparalleled layer of security and transparency through Fully Homomorphic Encryption (FHE). By harnessing the power of these cutting-edge technologies, we provide a secure, scalable, and privacy-preserving platform that enables users to exchange data and execute AI models with complete peace of mind. Whether you're a developer, a business, or an enthusiast exploring the potentials of AI, our platform opens up new horizons for secure data collaboration and innovation, ensuring that your data remains private and your AI endeavors are boundless.
                </p>
              </div>
            </div>
          </div>
        </div>

      </Content>
      {/* <Footer className="layout__footer">
        <div>

        </div>
      </Footer> */}
    </Layout>
  );
}

export default App;