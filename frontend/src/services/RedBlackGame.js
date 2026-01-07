export const COLORS = {
  RED: '#ff4757',
  BLACK: '#2f3542'
};

class Node {
  constructor(val, color = COLORS.RED, parent = null) {
    this.val = val;
    this.color = color;
    this.left = null;
    this.right = null;
    this.parent = parent;
    this.id = Math.random().toString(36).substr(2, 9);
    this.x = 0;
    this.y = 0;
  }
}

export class RedBlackTree {
  constructor() {
    this.root = null;
  }

  clear() {
    this.root = null;
  }

  insert(val) {
    if (!this.root) {
      this.root = new Node(val, COLORS.BLACK);
      return this.root;
    }

    let current = this.root;
    let parent = null;

    while (current) {
      parent = current;
      if (val < current.val) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    const newNode = new Node(val, COLORS.RED, parent);
    if (val < parent.val) {
      parent.left = newNode;
    } else {
      parent.right = newNode;
    }

    return newNode;
  }

  rotateLeft(node) {
    const rightChild = node.right;
    if (!rightChild) return;

    node.right = rightChild.left;
    if (rightChild.left) {
      rightChild.left.parent = node;
    }

    rightChild.parent = node.parent;
    if (!node.parent) {
      this.root = rightChild;
    } else if (node === node.parent.left) {
      node.parent.left = rightChild;
    } else {
      node.parent.right = rightChild;
    }

    rightChild.left = node;
    node.parent = rightChild;
  }

  rotateRight(node) {
    const leftChild = node.left;
    if (!leftChild) return;

    node.left = leftChild.right;
    if (leftChild.right) {
      leftChild.right.parent = node;
    }

    leftChild.parent = node.parent;
    if (!node.parent) {
      this.root = leftChild;
    } else if (node === node.parent.right) {
      node.parent.right = leftChild;
    } else {
      node.parent.left = leftChild;
    }

    leftChild.right = node;
    node.parent = leftChild;
  }

  // --- UPDATED: Returns both Nodes and Edges ---
  getVisualData() {
    const nodes = [];
    const edges = [];
    
    if (!this.root) return { nodes, edges };

    const INITIAL_WIDTH = 300; 
    
    // Helper to traverse and collect data
    const traverse = (node, depth, xPos, availableWidth) => {
      if (!node) return;

      // Calculate position
      node.y = depth * 80; 
      node.x = xPos;

      // Add Node
      nodes.push({
        id: node.id,
        val: node.val,
        color: node.color,
        x: node.x,
        y: node.y,
        type: node.color === COLORS.RED ? 'SORCERER' : 'KNIGHT'
      });

      // Calculate child width for next level
      const nextWidth = availableWidth / 2;

      // Process Left Child
      if (node.left) {
        const childX = xPos - availableWidth;
        const childY = (depth + 1) * 80;
        
        edges.push({
          id: `${node.id}-left`,
          x1: xPos,
          y1: node.y,
          x2: childX,
          y2: childY
        });
        
        traverse(node.left, depth + 1, childX, nextWidth);
      }

      // Process Right Child
      if (node.right) {
        const childX = xPos + availableWidth;
        const childY = (depth + 1) * 80;

        edges.push({
          id: `${node.id}-right`,
          x1: xPos,
          y1: node.y,
          x2: childX,
          y2: childY
        });

        traverse(node.right, depth + 1, childX, nextWidth);
      }
    };

    traverse(this.root, 0, 0, INITIAL_WIDTH);
    return { nodes, edges };
  }
}