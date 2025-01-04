export class ExecActionsChainError extends Error {
    actionIndex: number;
    constructor(message: string, actionIndex: number) {
      super(message);
      this.name = 'ExecActionsChainError';
      this.actionIndex = actionIndex;
    }
  }

export class ScrapingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScrapingError';
  }
}