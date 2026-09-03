A centred modal over a navy scrim; use it only for a decision or a short form, never to display content a page could hold.

    <Dialog open={open} onClose={close} eyebrow="航线" title="跳转到另一个岛？"
      footer={<><Button variant="ghost" onClick={close}>留在这里</Button><Button>继续</Button></>}>
      这条链接会离开当前课程的脉络。
    </Dialog>

Body copy is serif. It fades and rises 8px on entry - it never scales up from 0.9. Escape and scrim clicks both close.
