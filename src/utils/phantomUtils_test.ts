interface IWindow extends Window{
    phantom?:IPhantom;
  }
  interface IPhantom{
    solana: {
      isPhantom?: boolean;
      connect:()=>Promise<object>;
    };
  }
export function getProvider(){
        const windowTemp:IWindow=window;
        const provider = windowTemp.phantom?.solana;
  
        if (provider?.isPhantom) {
          return provider;
        }      
      window.open('https://www.phantom.app/', '_blank');
}