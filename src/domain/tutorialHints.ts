export interface HintItem {
  id: string;
  icon: string;
  title: string;
  text: string;
}

export class TutorialHintManager {
  private currentIndex: number = 0;
  private visible: boolean = true;

  private readonly hints: HintItem[] = [
    {
      id: 'look',
      icon: '👀',
      title: '視点の動かし方',
      text: '右画面を指でドラッグして周囲を見回せます。照準（＋）をブロックに合わせてみましょう。',
    },
    {
      id: 'mine',
      icon: '⛏️',
      title: 'ブロックを壊す（掘る）',
      text: '照準が合ったら右下の「⛏️ 掘る」ボタンを押すとブロックを破壊できます！',
    },
    {
      id: 'place',
      icon: '🧱',
      title: 'ブロックを置く（建築）',
      text: '置きたい場所の面に照準を合わせ、「🧱 置く」ボタンを押すと手持ちブロックを設置できます。',
    },
    {
      id: 'hotbar',
      icon: '🎒',
      title: 'ブロックの切り替え',
      text: '画面下のスロットをタップして切り替えます。「•••」ボタンを押すと全12種類のブロック一覧から選べます。',
    },
    {
      id: 'fly',
      icon: '🕊️',
      title: '飛行モードで自由建築',
      text: '「🕊️ 飛行」ボタンを押すと重力が無くなり、空中を自由に飛んで高層建築を楽しめます！',
    },
    {
      id: 'save',
      icon: '💾',
      title: 'ワールド保存 & ロード',
      text: '右上の「⚙️」設定ボタンから、作った建造物をブラウザにいつでもセーブ＆再読込できます。',
    },
    {
      id: 'pc',
      icon: '💻',
      title: 'PCキーボード & マウス',
      text: '画面クリックでマウス視点ロック（ESCで解除）。W/A/S/D移動、左クリックで掘る、右クリックで置くに対応！',
    },
  ];

  getAllHints(): HintItem[] {
    return this.hints;
  }

  getCurrentHint(): HintItem {
    return this.hints[this.currentIndex];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  nextHint(): HintItem {
    this.currentIndex = (this.currentIndex + 1) % this.hints.length;
    return this.getCurrentHint();
  }

  prevHint(): HintItem {
    this.currentIndex = (this.currentIndex - 1 + this.hints.length) % this.hints.length;
    return this.getCurrentHint();
  }

  dismiss(): void {
    this.visible = false;
  }

  show(): void {
    this.visible = true;
  }

  isVisible(): boolean {
    return this.visible;
  }
}

export const defaultHintManager = new TutorialHintManager();
