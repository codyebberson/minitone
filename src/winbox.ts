import { Component } from './component';
import styles from './winbox.module.css';

// Get the window dimensions

export interface WinBoxProps {
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: Component;
}

export class WinBox implements Component {
  private rect: DOMRect;
  private cursor: string;
  private root?: HTMLDivElement;

  constructor(readonly props: WinBoxProps) {
    this.rect = new DOMRect(props.x, props.y, props.width, props.height);
    this.cursor = 'default';
  }

  render(parent: HTMLElement): void {
    this.root = document.createElement('div');
    this.root.innerHTML = `
      <div class=${styles.titleBar}>${this.props.title}</div>
      <div class=${styles.body}></div>`;
    this.root.className = styles.frame;
    this.setCursor('default');
    this.setRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height, 'move');

    this.root.addEventListener('mousedown', (e) => this.handleFrameMouseDown(e));

    this.root.addEventListener('mousemove', (e) => this.handleFrameMouseMove(e));

    const titleBar = this.root.querySelector(`.${styles.titleBar}`) as HTMLDivElement;

    titleBar.addEventListener('mousedown', (e) => this.handleTitleBarMouseDown(e));

    const bodyContainer = this.root.querySelector(`.${styles.body}`) as HTMLDivElement;
    this.props.children.render(bodyContainer);

    parent.appendChild(this.root);
  }

  private setRect(
    x: number,
    y: number,
    width: number,
    height: number,
    mode: 'move' | 'resize'
  ): void {
    if (x < 0) {
      x = 0;
    }

    if (y < 0) {
      y = 0;
    }

    if (mode === 'resize') {
      if (x + width > window.innerWidth) {
        width = window.innerWidth - x;
      }

      if (y + height > window.innerHeight) {
        height = window.innerHeight - y;
      }
    } else {
      if (x + width > window.innerWidth) {
        x = window.innerWidth - width;
      }

      if (y + height > window.innerHeight) {
        y = window.innerHeight - height;
      }
    }

    this.rect.x = x;
    this.rect.y = y;
    this.rect.width = width;
    this.rect.height = height;
    if (this.root) {
      this.root.style.top = this.rect.top + 'px';
      this.root.style.left = this.rect.left + 'px';
      this.root.style.width = this.rect.width + 'px';
      this.root.style.height = this.rect.height + 'px';
    }
  }

  private setCursor(cursor: string): void {
    this.cursor = cursor;
    if (this.root) {
      this.root.style.cursor = cursor;
    }
  }

  private handleFrameMouseDown(e: MouseEvent): void {
    if (e.target !== this.root) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const dragMode = this.cursor;
    const startRect = new DOMRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    const dragOffset = new DOMPoint(e.clientX - startRect.x, e.clientY - startRect.y);

    const handleFrameMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      switch (dragMode) {
        case 'nw-resize':
          this.setRect(
            e.clientX - dragOffset.x,
            e.clientY - dragOffset.y,
            startRect.width + startRect.x - e.clientX,
            startRect.height + startRect.y - e.clientY,
            'resize'
          );
          break;
        case 'ne-resize':
          this.setRect(
            startRect.x,
            e.clientY - dragOffset.y,
            e.clientX - startRect.x,
            startRect.height + startRect.y - e.clientY,
            'resize'
          );
          break;
        case 'n-resize':
          this.setRect(
            startRect.x,
            e.clientY - dragOffset.y,
            startRect.width,
            startRect.height + startRect.y - e.clientY - 2,
            'resize'
          );
          break;

        case 'sw-resize':
          this.setRect(
            e.clientX - dragOffset.x,
            startRect.y,
            startRect.width + startRect.x - e.clientX,
            e.clientY - startRect.y,
            'resize'
          );
          break;
        case 'se-resize':
          this.setRect(
            startRect.x,
            startRect.y,
            e.clientX - startRect.x,
            e.clientY - startRect.y,
            'resize'
          );
          break;
        case 's-resize':
          this.setRect(
            startRect.x,
            startRect.y,
            startRect.width,
            e.clientY - startRect.y,
            'resize'
          );
          break;
        case 'w-resize':
          this.setRect(
            e.clientX - dragOffset.x,
            startRect.y,
            startRect.width + startRect.x - e.clientX,
            startRect.height,
            'resize'
          );
          break;
        case 'e-resize':
          this.setRect(
            startRect.x,
            startRect.y,
            e.clientX - startRect.x,
            startRect.height,
            'resize'
          );
          break;
      }
    };

    function handleFrameMouseUp(): void {
      document.removeEventListener('mousemove', handleFrameMouseMove, true);
      document.removeEventListener('mouseup', handleFrameMouseUp, true);
    }

    document.addEventListener('mousemove', handleFrameMouseMove, true);
    document.addEventListener('mouseup', handleFrameMouseUp, true);
  }

  private handleFrameMouseMove(e: MouseEvent): void {
    if (e.clientY < this.rect.top + 10) {
      if (e.clientX < this.rect.left + 10) {
        this.setCursor('nw-resize');
      } else if (e.clientX > this.rect.right - 10) {
        this.setCursor('ne-resize');
      } else {
        this.setCursor('n-resize');
      }
    } else if (e.clientY > this.rect.bottom - 10) {
      if (e.clientX < this.rect.left + 10) {
        this.setCursor('sw-resize');
      } else if (e.clientX > this.rect.right - 10) {
        this.setCursor('se-resize');
      } else {
        this.setCursor('s-resize');
      }
    } else if (e.clientX < this.rect.left + 10) {
      this.setCursor('w-resize');
    } else if (e.clientX > this.rect.right - 10) {
      this.setCursor('e-resize');
    } else {
      this.setCursor('default');
    }
  }

  private handleTitleBarMouseDown(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    const startRect = new DOMRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);

    const dragOffset = new DOMPoint(e.clientX - startRect.x, e.clientY - startRect.y);

    const handleTitleBarMouseMove = (e: MouseEvent): void => {
      this.setRect(
        e.clientX - dragOffset.x,
        e.clientY - dragOffset.y,
        startRect.width,
        startRect.height,
        'move'
      );
    };

    function handleTitleBarMouseUp(): void {
      document.removeEventListener('mousemove', handleTitleBarMouseMove, true);
      document.removeEventListener('mouseup', handleTitleBarMouseUp, true);
    }

    document.addEventListener('mousemove', handleTitleBarMouseMove, true);
    document.addEventListener('mouseup', handleTitleBarMouseUp, true);
  }
}
