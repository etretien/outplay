declare interface Window {
  MDS: {
    cmd: (param: string, callback: (balanceReturn) => void) => void;
    init: () => void;
  };
}
