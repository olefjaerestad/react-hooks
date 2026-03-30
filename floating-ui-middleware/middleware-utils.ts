function popoverIsOpen(popover: HTMLElement) {
  return popover.matches(':popover-open');
}

function isOutsideViewport(element: {
  getBoundingClientRect: () => {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}) {
  const rect = element.getBoundingClientRect();

  return (
    rect.bottom < 0 ||
    rect.top > document.documentElement.clientHeight ||
    rect.right < 0 ||
    rect.left > document.documentElement.clientWidth
  );
}

export { isOutsideViewport, popoverIsOpen };
