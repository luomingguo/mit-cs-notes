/* @ds-bundle: {"format":4,"namespace":"ArchipelagoDesignSystem_958ced","components":[{"name":"Icon","sourcePath":"components/brand/Icon.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Callout","sourcePath":"components/core/Callout.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Divider","sourcePath":"components/core/Divider.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"BacklinkList","sourcePath":"components/knowledge/BacklinkList.jsx"},{"name":"ConceptLink","sourcePath":"components/knowledge/ConceptLink.jsx"},{"name":"CourseCard","sourcePath":"components/knowledge/CourseCard.jsx"},{"name":"DomainCard","sourcePath":"components/knowledge/DomainCard.jsx"},{"name":"NoteCard","sourcePath":"components/knowledge/NoteCard.jsx"},{"name":"Breadcrumb","sourcePath":"components/navigation/Breadcrumb.jsx"},{"name":"SidebarNav","sourcePath":"components/navigation/SidebarNav.jsx"},{"name":"TableOfContents","sourcePath":"components/navigation/TableOfContents.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/brand/Icon.jsx":"ab98ff94b4e9","components/brand/Logo.jsx":"7919f4acf377","components/core/Badge.jsx":"7a426ddddef1","components/core/Button.jsx":"ebe38982fca2","components/core/Callout.jsx":"f3d2f561ae94","components/core/Card.jsx":"ce786931b5c5","components/core/Divider.jsx":"f9e4191deb2a","components/core/IconButton.jsx":"c7ee16b36c1e","components/core/Tag.jsx":"694600bfe2e2","components/feedback/Dialog.jsx":"5508285e1f6e","components/feedback/Toast.jsx":"7080556d4420","components/feedback/Tooltip.jsx":"aa96f51f2ab5","components/forms/Checkbox.jsx":"b903c755a697","components/forms/Field.jsx":"8d4181e90d87","components/forms/Input.jsx":"3b3321911dfb","components/forms/Radio.jsx":"467901123157","components/forms/Select.jsx":"78ab5efdf3d8","components/forms/Switch.jsx":"af3786024bc0","components/forms/Textarea.jsx":"41cf00bfa38f","components/knowledge/BacklinkList.jsx":"1a89dc8cd34f","components/knowledge/ConceptLink.jsx":"779b6dc49be2","components/knowledge/CourseCard.jsx":"add2811ae700","components/knowledge/DomainCard.jsx":"25c4f1ab4a93","components/knowledge/NoteCard.jsx":"29bca9cfbe0b","components/navigation/Breadcrumb.jsx":"59a458d00f07","components/navigation/SidebarNav.jsx":"44eaa9888a3f","components/navigation/TableOfContents.jsx":"636115050803","components/navigation/Tabs.jsx":"1c35a22ed118","ui_kits/archipelago-web/AtlasHome.jsx":"3a80f05e1409","ui_kits/archipelago-web/ConceptScreen.jsx":"03cd6bdf1918","ui_kits/archipelago-web/DomainScreen.jsx":"a13b7d17e495","ui_kits/archipelago-web/LectureScreen.jsx":"6f09e54fdc01","ui_kits/archipelago-web/SearchOverlay.jsx":"e519f7bfb8be","ui_kits/archipelago-web/Shell.jsx":"e792025db247","ui_kits/archipelago-web/data.jsx":"321174a4baa9"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ArchipelagoDesignSystem_958ced = window.ArchipelagoDesignSystem_958ced || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const BASE = 'https://cdn.jsdelivr.net/npm/lucide-static@0.544.0/icons/';

/* Lucide glyph rendered as a CSS mask so it inherits currentColor.
   Substituted icon set — see readme.md section 4. */
function Icon({
  name,
  size = 18,
  color = 'currentColor',
  style,
  ...rest
}) {
  const url = 'url(' + BASE + name + '.svg)';
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true"
  }, rest, {
    style: {
      display: 'inline-block',
      width: size,
      height: size,
      flex: '0 0 auto',
      backgroundColor: color,
      WebkitMaskImage: url,
      maskImage: url,
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
      maskPosition: 'center',
      WebkitMaskSize: 'contain',
      maskSize: 'contain',
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Icon.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const DEFAULT_SRC = 'assets/logo-archipelago-badge-256.png';

/* Horizontal lockup: the badge plus the name in Playfair Display.
   No wordmark file was supplied by the brand - see readme.md section 4. */
function Logo({
  src = DEFAULT_SRC,
  size = 40,
  showName = true,
  showCn = true,
  tone = 'auto',
  href,
  style,
  ...rest
}) {
  const nameColor = tone === 'inverse' ? 'var(--paper-50)' : tone === 'ink' ? 'var(--navy-900)' : 'var(--text-heading)';
  const cnColor = tone === 'inverse' ? 'var(--text-inverse-muted)' : 'var(--text-muted)';
  const Tag = href ? 'a' : 'span';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href
  }, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: size > 32 ? 'var(--space-5)' : 'var(--space-4)',
      textDecoration: 'none',
      ...style
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "Archipelago",
    width: size,
    height: size,
    style: {
      width: size,
      height: size,
      display: 'block'
    }
  }), showName && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-semibold) ' + Math.round(size * 0.52) + 'px/1.05 var(--font-wordmark)',
      color: nameColor,
      letterSpacing: '-0.01em'
    }
  }, "Archipelago"), showCn && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-medium) ' + Math.max(10, Math.round(size * 0.24)) + 'px/1.2 var(--font-sans)',
      color: cnColor,
      letterSpacing: 'var(--tracking-label)'
    }
  }, "\u7FA4\u5C9B \xB7 \u516C\u5F00\u8BFE\u7B14\u8BB0")));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    fg: 'var(--text-muted)',
    bg: 'var(--surface-sunken)',
    bd: 'var(--border-hairline)',
    solid: 'var(--navy-800)'
  },
  ocean: {
    fg: 'var(--ocean-700)',
    bg: 'var(--ocean-100)',
    bd: 'rgba(15,92,147,.22)',
    solid: 'var(--ocean-600)'
  },
  gold: {
    fg: 'var(--gold-600)',
    bg: 'var(--gold-200)',
    bd: 'rgba(168,124,44,.28)',
    solid: 'var(--gold-500)'
  },
  kelp: {
    fg: 'var(--kelp-700)',
    bg: 'var(--kelp-200)',
    bd: 'rgba(47,107,87,.26)',
    solid: 'var(--kelp-600)'
  },
  coral: {
    fg: 'var(--coral-700)',
    bg: 'var(--coral-200)',
    bd: 'rgba(180,80,58,.26)',
    solid: 'var(--coral-600)'
  }
};
function Badge({
  tone = 'neutral',
  variant = 'soft',
  icon,
  uppercase = false,
  children,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  const skin = variant === 'solid' ? {
    background: t.solid,
    color: 'var(--paper-50)',
    border: '1px solid transparent'
  } : variant === 'outline' ? {
    background: 'transparent',
    color: t.fg,
    border: '1px solid ' + t.bd
  } : {
    background: t.bg,
    color: t.fg,
    border: '1px solid ' + t.bd
  };
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: '2px var(--space-4)',
      borderRadius: 'var(--radius-xs)',
      font: 'var(--fw-medium) var(--fs-micro)/1.5 var(--font-sans)',
      letterSpacing: uppercase ? 'var(--tracking-label)' : '0.02em',
      textTransform: uppercase ? 'uppercase' : 'none',
      whiteSpace: 'nowrap',
      ...skin,
      ...style
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 11
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    h: 'var(--control-h-sm)',
    px: 'var(--pad-control-sm-x)',
    fs: 'var(--fs-meta)',
    icon: 14,
    gap: 'var(--space-3)'
  },
  md: {
    h: 'var(--control-h)',
    px: 'var(--pad-control-x)',
    fs: 'var(--fs-body-sm)',
    icon: 16,
    gap: 'var(--space-4)'
  },
  lg: {
    h: 'var(--control-h-lg)',
    px: 'var(--pad-control-lg-x)',
    fs: 'var(--fs-body)',
    icon: 18,
    gap: 'var(--space-4)'
  }
};
function skin(variant, hover, press) {
  if (variant === 'primary') return {
    background: press ? 'var(--accent-press)' : hover ? 'var(--accent-hover)' : 'var(--accent)',
    color: 'var(--paper-50)',
    border: '1px solid transparent'
  };
  if (variant === 'danger') return {
    background: press ? 'var(--coral-700)' : hover ? 'var(--coral-700)' : 'var(--danger)',
    color: 'var(--paper-50)',
    border: '1px solid transparent'
  };
  if (variant === 'secondary') return {
    background: press ? 'var(--surface-sunken)' : hover ? 'var(--surface-raised)' : 'var(--surface-card)',
    color: 'var(--text-heading)',
    border: '1px solid ' + (hover ? 'var(--border-strong)' : 'var(--border-subtle)')
  };
  if (variant === 'ghost') return {
    background: press ? 'var(--surface-ghost-press)' : hover ? 'var(--surface-ghost-hover)' : 'transparent',
    color: hover ? 'var(--text-heading)' : 'var(--text-body)',
    border: '1px solid transparent'
  };
  return {
    /* quiet: text-only, reads as a link but sits on the control baseline */
    background: 'transparent',
    color: hover ? 'var(--text-link-hover)' : 'var(--text-link)',
    border: '1px solid transparent',
    padding: 0
  };
}
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  disabled = false,
  href,
  type = 'button',
  children,
  style,
  onClick,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const quiet = variant === 'quiet';
  const Tag = href ? 'a' : 'button';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: disabled ? undefined : href,
    type: href ? undefined : type,
    disabled: Tag === 'button' ? disabled : undefined,
    "aria-disabled": disabled || undefined,
    onClick: disabled ? undefined : onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false)
  }, rest, {
    style: {
      display: fullWidth ? 'flex' : 'inline-flex',
      width: fullWidth ? '100%' : undefined,
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: quiet ? 'auto' : s.h,
      padding: quiet ? 0 : '0 ' + s.px,
      font: 'var(--fw-medium) ' + 'var(--fs-body-sm)' + '/1 var(--font-sans)',
      fontSize: s.fs,
      borderRadius: quiet ? 0 : 'var(--radius-sm)',
      textDecoration: quiet ? 'underline' : 'none',
      textDecorationThickness: '1px',
      textUnderlineOffset: '0.24em',
      textDecorationColor: quiet && !hover ? 'color-mix(in oklab, currentColor 38%, transparent)' : 'currentColor',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transform: press && !disabled && !quiet ? 'scale(var(--press-scale))' : 'none',
      transition: 'var(--transition-control), transform var(--dur-instant) var(--ease-tide)',
      whiteSpace: 'nowrap',
      WebkitAppearance: 'none',
      ...skin(variant, hover && !disabled, press && !disabled),
      ...style
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon
  }), children, iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.icon
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Callout.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The margin apparatus of a note: what to read first, where to sail next. */
const KINDS = {
  note: {
    icon: 'file-text',
    label: '注',
    accent: 'var(--border-strong)',
    tint: 'var(--surface-sunken)'
  },
  prereq: {
    icon: 'anchor',
    label: '需要先读',
    accent: 'var(--gold-500)',
    tint: 'rgba(199,154,62,.08)'
  },
  next: {
    icon: 'arrow-right',
    label: '接下来可以读',
    accent: 'var(--ocean-500)',
    tint: 'var(--ocean-100)'
  },
  caution: {
    icon: 'triangle-alert',
    label: '留意',
    accent: 'var(--coral-600)',
    tint: 'rgba(180,80,58,.07)'
  },
  log: {
    icon: 'compass',
    label: '航海日志',
    accent: 'var(--navy-700)',
    tint: 'rgba(0,26,61,.045)'
  }
};
function Callout({
  kind = 'note',
  label,
  tinted = true,
  children,
  style,
  ...rest
}) {
  const k = KINDS[kind] || KINDS.note;
  return /*#__PURE__*/React.createElement("aside", _extends({}, rest, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: 'var(--space-5)',
      padding: 'var(--space-6) var(--space-7)',
      background: tinted ? k.tint : 'transparent',
      borderTop: '1px solid ' + k.accent,
      borderBottom: '1px dashed var(--route-line)',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: k.icon,
    size: 16,
    color: k.accent,
    style: {
      marginTop: 4
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: 'var(--space-3)'
    }
  }, label || k.label), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-regular) var(--fs-body-sm)/1.75 var(--font-serif)',
      color: 'var(--text-body)'
    }
  }, children)));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Callout.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PADS = {
  none: 0,
  sm: 'var(--space-6)',
  md: 'var(--pad-card)',
  lg: 'var(--pad-card-lg)'
};
function Card({
  padding = 'md',
  interactive = false,
  sheen = false,
  href,
  onClick,
  as,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const live = interactive || Boolean(href || onClick);
  const Tag = as || (href ? 'a' : onClick ? 'button' : 'div');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest, {
    style: {
      display: 'block',
      textAlign: 'left',
      width: '100%',
      boxSizing: 'border-box',
      background: 'var(--surface-card)',
      border: '1px solid ' + (live && hover ? 'var(--border-subtle)' : 'var(--border-hairline)'),
      borderRadius: 'var(--radius-card)',
      padding: PADS[padding] !== undefined ? PADS[padding] : PADS.md,
      boxShadow: live && hover ? 'var(--shadow-2)' + (sheen ? ', var(--shadow-inset-top)' : '') : 'var(--shadow-1)' + (sheen ? ', var(--shadow-inset-top)' : ''),
      transform: live && hover ? 'var(--lift-hover)' : 'none',
      transition: 'var(--transition-lift), border-color var(--dur-fast) var(--ease-tide)',
      textDecoration: 'none',
      color: 'inherit',
      cursor: live ? 'pointer' : 'default',
      font: 'inherit',
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Divider.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Divider({
  variant = 'hairline',
  orientation = 'horizontal',
  label,
  style,
  ...rest
}) {
  const vertical = orientation === 'vertical';
  const line = variant === 'route' ? {
    borderStyle: 'dashed',
    borderColor: 'var(--route-line)'
  } : variant === 'gold' ? {
    border: 0,
    background: 'linear-gradient(90deg,transparent,var(--rule-gold) 18%,var(--rule-gold) 82%,transparent)'
  } : {
    borderStyle: 'solid',
    borderColor: 'var(--border-hairline)'
  };
  if (label) {
    return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-6)',
        ...style
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        borderTop: '1px ' + (variant === 'route' ? 'dashed' : 'solid') + ' ' + (variant === 'route' ? 'var(--route-line)' : 'var(--border-hairline)')
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--text-faint)'
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        borderTop: '1px ' + (variant === 'route' ? 'dashed' : 'solid') + ' ' + (variant === 'route' ? 'var(--route-line)' : 'var(--border-hairline)')
      }
    }));
  }
  return /*#__PURE__*/React.createElement("hr", _extends({}, rest, {
    style: {
      margin: 0,
      border: 0,
      ...(vertical ? {
        width: 1,
        height: '100%',
        borderLeft: variant === 'gold' ? undefined : '1px solid',
        ...(variant === 'gold' ? {
          background: 'linear-gradient(180deg,transparent,var(--rule-gold) 18%,var(--rule-gold) 82%,transparent)'
        } : {})
      } : {
        height: variant === 'gold' ? 1 : 0,
        borderTop: variant === 'gold' ? undefined : '1px solid'
      }),
      ...line,
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Divider.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    box: 28,
    icon: 15
  },
  md: {
    box: 34,
    icon: 18
  },
  lg: {
    box: 42,
    icon: 20
  }
};
function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  active = false,
  disabled = false,
  href,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const Tag = href ? 'a' : 'button';
  const skin = variant === 'solid' ? {
    background: press ? 'var(--accent-press)' : hover ? 'var(--accent-hover)' : 'var(--accent)',
    color: 'var(--paper-50)',
    border: '1px solid transparent'
  } : variant === 'outline' ? {
    background: hover ? 'var(--surface-raised)' : 'var(--surface-card)',
    color: 'var(--text-heading)',
    border: '1px solid ' + (hover ? 'var(--border-strong)' : 'var(--border-subtle)')
  } : {
    background: active ? 'var(--surface-ghost-press)' : press ? 'var(--surface-ghost-press)' : hover ? 'var(--surface-ghost-hover)' : 'transparent',
    color: active || hover ? 'var(--text-heading)' : 'var(--text-muted)',
    border: '1px solid transparent'
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: disabled ? undefined : href,
    type: href ? undefined : 'button',
    "aria-label": label,
    title: label,
    disabled: Tag === 'button' ? disabled : undefined,
    onClick: disabled ? undefined : onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false)
  }, rest, {
    style: {
      display: 'inline-grid',
      placeItems: 'center',
      width: s.box,
      height: s.box,
      borderRadius: 'var(--radius-sm)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      padding: 0,
      transform: press && !disabled ? 'scale(var(--press-scale))' : 'none',
      transition: 'var(--transition-control), transform var(--dur-instant) var(--ease-tide)',
      ...skin,
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  href,
  onClick,
  onRemove,
  size = 'md',
  active = false,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const clickable = Boolean(href || onClick);
  const Tag_ = href ? 'a' : onClick ? 'button' : 'span';
  const sm = size === 'sm';
  return /*#__PURE__*/React.createElement(Tag_, _extends({
    href: href,
    onClick: onClick,
    type: onClick && !href ? 'button' : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: sm ? 3 : 'var(--space-2)',
      padding: sm ? '2px 8px 2px 6px' : '3px 11px 3px 8px',
      borderRadius: 'var(--radius-pill)',
      border: '1px solid ' + (active ? 'rgba(15,92,147,.4)' : hover && clickable ? 'var(--border-subtle)' : 'var(--border-hairline)'),
      background: active ? 'var(--ocean-100)' : hover && clickable ? 'var(--surface-ghost-hover)' : 'transparent',
      color: active ? 'var(--ocean-700)' : hover && clickable ? 'var(--text-heading)' : 'var(--text-muted)',
      font: 'var(--fw-regular) ' + (sm ? 'var(--fs-micro)' : 'var(--fs-meta)') + '/1.5 var(--font-sans)',
      textDecoration: 'none',
      cursor: clickable ? 'pointer' : 'default',
      transition: 'var(--transition-control)',
      whiteSpace: 'nowrap',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "hash",
    size: sm ? 10 : 12,
    color: active ? 'var(--ocean-500)' : 'var(--text-faint)'
  }), children, onRemove && /*#__PURE__*/React.createElement("span", {
    role: "button",
    "aria-label": "\u79FB\u9664",
    onClick: e => {
      e.preventDefault();
      e.stopPropagation();
      onRemove(e);
    },
    style: {
      display: 'inline-flex',
      marginLeft: 2,
      opacity: 0.6
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: sm ? 10 : 12
  })));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Dialog({
  open = false,
  title,
  eyebrow,
  onClose,
  footer,
  width = 520,
  children,
  style,
  ...rest
}) {
  React.useEffect(() => {
    if (!open || !onClose) return undefined;
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    role: "presentation",
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      display: 'grid',
      placeItems: 'center',
      padding: 'var(--space-9)',
      background: 'var(--surface-scrim)',
      animation: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    "aria-label": title
  }, rest, {
    style: {
      width: '100%',
      maxWidth: width,
      background: 'var(--surface-raised)',
      border: '1px solid var(--border-hairline)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-3)',
      overflow: 'hidden',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-6)',
      padding: 'var(--pad-card) var(--pad-card) var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--text-accent)',
      marginBottom: 'var(--space-4)'
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--type-h3)',
      color: 'var(--text-heading)',
      margin: 0
    }
  }, title)), onClose && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "\u5173\u95ED",
    size: "sm",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--pad-card) var(--pad-card)',
      font: 'var(--fw-regular) var(--fs-body-sm)/1.75 var(--font-serif)',
      color: 'var(--text-body)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 'var(--space-5)',
      padding: 'var(--space-6) var(--pad-card)',
      borderTop: '1px solid var(--border-hairline)',
      background: 'var(--surface-sunken)'
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    icon: 'info',
    accent: 'var(--navy-700)'
  },
  success: {
    icon: 'check',
    accent: 'var(--success)'
  },
  warning: {
    icon: 'triangle-alert',
    accent: 'var(--warning)'
  },
  danger: {
    icon: 'octagon-alert',
    accent: 'var(--danger)'
  }
};
function Toast({
  tone = 'neutral',
  title,
  children,
  action,
  onDismiss,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status"
  }, rest, {
    style: {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      alignItems: 'start',
      gap: 'var(--space-5)',
      minWidth: 300,
      maxWidth: 420,
      padding: 'var(--space-6) var(--space-6) var(--space-6) var(--space-7)',
      background: 'var(--navy-900)',
      color: 'var(--text-inverse)',
      borderRadius: 'var(--radius-sm)',
      borderTop: '2px solid ' + t.accent,
      boxShadow: 'var(--shadow-3)',
      ...style
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.icon,
    size: 16,
    color: t.accent,
    style: {
      marginTop: 2
    }
  }), /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--fw-medium) var(--fs-body-sm)/1.45 var(--font-sans)',
      color: 'var(--paper-50)'
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-inverse-muted)',
      marginTop: title ? 3 : 0
    }
  }, children), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-5)'
    }
  }, action)), onDismiss && /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    icon: "x",
    label: "\u5173\u95ED",
    size: "sm",
    onClick: onDismiss,
    style: {
      color: 'var(--text-inverse-muted)'
    }
  }));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const POS = {
  top: {
    bottom: '100%',
    left: '50%',
    transform: 'translate(-50%,-8px)'
  },
  bottom: {
    top: '100%',
    left: '50%',
    transform: 'translate(-50%,8px)'
  },
  left: {
    right: '100%',
    top: '50%',
    transform: 'translate(-8px,-50%)'
  },
  right: {
    left: '100%',
    top: '50%',
    transform: 'translate(8px,-50%)'
  }
};
function Tooltip({
  content,
  placement = 'top',
  kbd,
  children,
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false),
    style: {
      position: 'relative',
      display: 'inline-flex',
      ...style
    }
  }), children, /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      zIndex: 40,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: '5px var(--space-5)',
      background: 'var(--navy-900)',
      color: 'var(--paper-100)',
      borderRadius: 'var(--radius-xs)',
      boxShadow: 'var(--shadow-2)',
      font: 'var(--fw-regular) var(--fs-micro)/1.5 var(--font-sans)',
      opacity: open ? 1 : 0,
      transition: 'opacity var(--dur-fast) var(--ease-tide)',
      ...POS[placement]
    }
  }, content, kbd && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--ocean-300)'
    }
  }, kbd)));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  hint,
  checked,
  defaultChecked,
  onChange,
  disabled,
  id,
  style,
  ...rest
}) {
  const [inner, setInner] = React.useState(Boolean(defaultChecked));
  const isOn = checked !== undefined ? checked : inner;
  const auto = React.useMemo(() => 'cb-' + Math.random().toString(36).slice(2, 7), []);
  const uid = id || auto;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: uid,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-grid',
      gridTemplateColumns: 'auto 1fr',
      gap: 'var(--space-5)',
      alignItems: 'start',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      minHeight: 'var(--space-7)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: uid,
    type: "checkbox",
    checked: isOn,
    disabled: disabled,
    onChange: e => {
      if (checked === undefined) setInner(e.target.checked);
      if (onChange) onChange(e);
    }
  }, rest, {
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1,
      margin: 0
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 17,
      height: 17,
      marginTop: 2,
      display: 'grid',
      placeItems: 'center',
      borderRadius: 'var(--radius-xs)',
      background: isOn ? 'var(--accent)' : 'var(--surface-raised)',
      border: '1px solid ' + (isOn ? 'var(--accent)' : hover ? 'var(--border-strong)' : 'var(--border-subtle)'),
      boxShadow: isOn ? 'none' : 'var(--shadow-inset-field)',
      transition: 'var(--transition-control)'
    }
  }, isOn && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 12,
    color: "var(--paper-50)"
  })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-sans)',
      color: 'var(--text-heading)'
    }
  }, label), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--type-meta)',
      color: 'var(--text-faint)',
      marginTop: 2
    }
  }, hint)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Label + hint/error shell shared by every form control. */
function Field({
  label,
  hint,
  error,
  htmlFor,
  inline = false,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      ...style
    }
  }), label && /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, label), children, (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: error ? 'var(--danger)' : 'var(--text-faint)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const H = {
  sm: 'var(--control-h-sm)',
  md: 'var(--control-h)',
  lg: 'var(--control-h-lg)'
};
function Input({
  label,
  hint,
  error,
  icon,
  suffix,
  size = 'md',
  id,
  disabled,
  style,
  wrapperStyle,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const auto = React.useMemo(() => 'in-' + Math.random().toString(36).slice(2, 7), []);
  const uid = id || auto;
  const border = error ? 'var(--danger)' : focus ? 'var(--border-focus)' : hover ? 'var(--border-strong)' : 'var(--border-subtle)';
  return /*#__PURE__*/React.createElement(__ds_scope.Field, {
    label: label,
    hint: hint,
    error: error,
    htmlFor: uid,
    style: wrapperStyle
  }, /*#__PURE__*/React.createElement("div", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      height: H[size] || H.md,
      padding: '0 var(--pad-field-x)',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-raised)',
      border: '1px solid ' + border,
      borderRadius: 'var(--radius-sm)',
      boxShadow: focus ? 'var(--shadow-focus)' : 'var(--shadow-inset-field)',
      transition: 'var(--transition-control)',
      opacity: disabled ? 0.55 : 1
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 15,
    color: focus ? 'var(--accent)' : 'var(--text-faint)'
  }), /*#__PURE__*/React.createElement("input", _extends({
    id: uid,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false)
  }, rest, {
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 'none',
      background: 'transparent',
      font: 'var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-sans)',
      color: 'var(--text-heading)',
      padding: 0,
      ...style
    }
  })), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-faint)',
      whiteSpace: 'nowrap'
    }
  }, suffix)));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  name,
  options = [],
  value,
  defaultValue,
  onChange,
  disabled,
  direction = 'column',
  style,
  ...rest
}) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value !== undefined ? value : inner;
  const autoName = React.useMemo(() => 'rd-' + Math.random().toString(36).slice(2, 7), []);
  const gname = name || autoName;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "radiogroup"
  }, rest, {
    style: {
      display: 'flex',
      flexDirection: direction,
      gap: direction === 'row' ? 'var(--space-8)' : 'var(--space-5)',
      ...style
    }
  }), options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    const on = current === opt.value;
    return /*#__PURE__*/React.createElement("label", {
      key: opt.value,
      style: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 'var(--space-5)',
        alignItems: 'start',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: gname,
      value: opt.value,
      checked: on,
      disabled: disabled,
      onChange: () => {
        if (value === undefined) setInner(opt.value);
        if (onChange) onChange(opt.value);
      },
      style: {
        position: 'absolute',
        opacity: 0,
        width: 1,
        height: 1,
        margin: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 17,
        height: 17,
        marginTop: 2,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--surface-raised)',
        border: '1px solid ' + (on ? 'var(--accent)' : 'var(--border-subtle)'),
        boxShadow: on ? 'none' : 'var(--shadow-inset-field)',
        transition: 'var(--transition-control)'
      }
    }, on && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: '50%',
        background: 'var(--accent)'
      }
    })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-sans)',
        color: 'var(--text-heading)'
      }
    }, opt.label), opt.hint && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        font: 'var(--type-meta)',
        color: 'var(--text-faint)',
        marginTop: 2
      }
    }, opt.hint)));
  }));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const H = {
  sm: 'var(--control-h-sm)',
  md: 'var(--control-h)',
  lg: 'var(--control-h-lg)'
};
function Select({
  label,
  hint,
  error,
  options = [],
  size = 'md',
  id,
  disabled,
  placeholder,
  style,
  wrapperStyle,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const auto = React.useMemo(() => 'se-' + Math.random().toString(36).slice(2, 7), []);
  const uid = id || auto;
  return /*#__PURE__*/React.createElement(__ds_scope.Field, {
    label: label,
    hint: hint,
    error: error,
    htmlFor: uid,
    style: wrapperStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: uid,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false)
  }, rest, {
    style: {
      width: '100%',
      height: H[size] || H.md,
      WebkitAppearance: 'none',
      appearance: 'none',
      padding: '0 34px 0 var(--pad-field-x)',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-raised)',
      border: '1px solid ' + (error ? 'var(--danger)' : focus ? 'var(--border-focus)' : 'var(--border-subtle)'),
      borderRadius: 'var(--radius-sm)',
      boxShadow: focus ? 'var(--shadow-focus)' : 'var(--shadow-inset-field)',
      font: 'var(--fw-regular) var(--fs-body-sm)/1 var(--font-sans)',
      color: 'var(--text-heading)',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'var(--transition-control)',
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  }), placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => {
    const opt = typeof o === 'string' ? {
      value: o,
      label: o
    } : o;
    return /*#__PURE__*/React.createElement("option", {
      key: opt.value,
      value: opt.value
    }, opt.label);
  })), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 15,
    color: "var(--text-faint)",
    style: {
      position: 'absolute',
      right: 'var(--space-5)',
      pointerEvents: 'none'
    }
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  label,
  hint,
  checked,
  defaultChecked,
  onChange,
  disabled,
  id,
  style,
  ...rest
}) {
  const [inner, setInner] = React.useState(Boolean(defaultChecked));
  const on = checked !== undefined ? checked : inner;
  const auto = React.useMemo(() => 'sw-' + Math.random().toString(36).slice(2, 7), []);
  const uid = id || auto;
  return /*#__PURE__*/React.createElement("label", _extends({
    htmlFor: uid
  }, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-6)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      ...style
    }
  }), /*#__PURE__*/React.createElement("input", {
    id: uid,
    type: "checkbox",
    role: "switch",
    checked: on,
    disabled: disabled,
    onChange: e => {
      if (checked === undefined) setInner(e.target.checked);
      if (onChange) onChange(e);
    },
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1,
      margin: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 38,
      height: 21,
      flex: '0 0 auto',
      borderRadius: 'var(--radius-pill)',
      position: 'relative',
      background: on ? 'var(--accent)' : 'var(--sand-400)',
      boxShadow: 'var(--shadow-inset-field)',
      transition: 'background-color var(--dur-base) var(--ease-tide)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: on ? 19 : 2,
      width: 17,
      height: 17,
      borderRadius: '50%',
      background: 'var(--paper-50)',
      boxShadow: 'var(--shadow-1)',
      transition: 'left var(--dur-base) var(--ease-tide)'
    }
  })), (label || hint) && /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--fw-regular) var(--fs-body-sm)/1.5 var(--font-sans)',
      color: 'var(--text-heading)'
    }
  }, label), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--type-meta)',
      color: 'var(--text-faint)',
      marginTop: 2
    }
  }, hint)));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Textarea({
  label,
  hint,
  error,
  rows = 4,
  id,
  disabled,
  style,
  wrapperStyle,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const auto = React.useMemo(() => 'ta-' + Math.random().toString(36).slice(2, 7), []);
  const uid = id || auto;
  return /*#__PURE__*/React.createElement(__ds_scope.Field, {
    label: label,
    hint: hint,
    error: error,
    htmlFor: uid,
    style: wrapperStyle
  }, /*#__PURE__*/React.createElement("textarea", _extends({
    id: uid,
    rows: rows,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false)
  }, rest, {
    style: {
      width: '100%',
      boxSizing: 'border-box',
      resize: 'vertical',
      padding: 'var(--pad-field-y) var(--pad-field-x)',
      background: disabled ? 'var(--surface-sunken)' : 'var(--surface-raised)',
      border: '1px solid ' + (error ? 'var(--danger)' : focus ? 'var(--border-focus)' : 'var(--border-subtle)'),
      borderRadius: 'var(--radius-sm)',
      boxShadow: focus ? 'var(--shadow-focus)' : 'var(--shadow-inset-field)',
      font: 'var(--fw-regular) var(--fs-body-sm)/1.7 var(--font-serif)',
      color: 'var(--text-heading)',
      outline: 'none',
      transition: 'var(--transition-control)',
      opacity: disabled ? 0.55 : 1,
      ...style
    }
  })));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/knowledge/BacklinkList.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Answers "接下来可以读什么" from the incoming direction: who points here. */
function Row({
  item
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", {
    href: item.href || '#',
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'block',
      textDecoration: 'none',
      padding: 'var(--space-5) 0 var(--space-5) var(--space-6)',
      borderLeft: '1px solid ' + (hover ? 'var(--accent)' : 'var(--border-hairline)'),
      transition: 'var(--transition-control)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "corner-down-right",
    size: 11,
    color: hover ? 'var(--accent)' : 'var(--text-faint)'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      fontSize: 'var(--fs-micro)',
      color: 'var(--text-faint)'
    }
  }, item.course)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--fw-medium) var(--fs-body-sm)/1.45 var(--font-display)',
      color: hover ? 'var(--text-link-hover)' : 'var(--text-heading)',
      transition: 'var(--transition-control)'
    }
  }, item.title), item.context && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--fw-regular) var(--fs-meta)/1.7 var(--font-serif)',
      color: 'var(--text-muted)',
      marginTop: 4
    }
  }, item.context));
}
function BacklinkList({
  items = [],
  title = '反向链接',
  empty = '还没有讲义指向这里。',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({}, rest, {
    style: {
      ...style
    }
  }), title && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--text-muted)'
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      borderTop: '1px dashed var(--route-line)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-mono)',
      fontSize: 'var(--fs-micro)',
      color: 'var(--text-faint)'
    }
  }, items.length)), items.length === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--fw-regular) var(--fs-meta)/1.7 var(--font-serif)',
      color: 'var(--text-faint)',
      margin: 0
    }
  }, empty) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement(Row, {
    key: it.title + i,
    item: it
  }))));
}
Object.assign(__ds_scope, { BacklinkList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/knowledge/BacklinkList.jsx", error: String((e && e.message) || e) }); }

// components/knowledge/ConceptLink.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The sea lane made concrete: an inline 内部链接 that previews its destination. */
function ConceptLink({
  href = '#',
  label,
  summary,
  kind = '概念',
  source,
  children,
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const showCard = Boolean(summary) && open;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline'
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false)
  }, /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false)
  }, rest, {
    style: {
      color: open ? 'var(--text-link-hover)' : 'var(--text-link)',
      textDecorationLine: 'underline',
      textDecorationStyle: 'dashed',
      textDecorationThickness: '1px',
      textUnderlineOffset: '0.22em',
      textDecorationColor: open ? 'currentColor' : 'color-mix(in oklab, var(--text-link) 45%, transparent)',
      transition: 'var(--transition-control)',
      ...style
    }
  }), children || label), showCard && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      zIndex: 50,
      bottom: '100%',
      left: 0,
      marginBottom: 10,
      display: 'block',
      width: 306,
      padding: 'var(--space-6) var(--space-7)',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border-subtle)',
      borderTop: '2px solid var(--rule-gold)',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-2)',
      textAlign: 'left',
      cursor: 'default'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--text-accent)',
      marginBottom: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "tower-control",
    size: 11
  }), kind), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--fw-medium) var(--fs-body-sm)/1.4 var(--font-display)',
      color: 'var(--text-heading)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--fw-regular) var(--fs-meta)/1.7 var(--font-serif)',
      color: 'var(--text-muted)',
      marginTop: 'var(--space-4)'
    }
  }, summary), source && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      font: 'var(--type-meta)',
      fontSize: 'var(--fs-micro)',
      color: 'var(--text-faint)',
      marginTop: 'var(--space-5)'
    }
  }, source)));
}
Object.assign(__ds_scope, { ConceptLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/knowledge/ConceptLink.jsx", error: String((e && e.message) || e) }); }

// components/knowledge/CourseCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* One 课程 — an island. Keeps the course's own spine visible. */
function CourseCard({
  title,
  institution,
  code,
  summary,
  noteCount,
  conceptCount,
  domain,
  progress,
  href,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
    href: href,
    padding: "md",
    sheen: true,
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "book-open",
    size: 15,
    color: "var(--ocean-500)"
  }), code && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-mono)',
      fontSize: 'var(--fs-micro)',
      letterSpacing: '.04em',
      color: 'var(--text-muted)'
    }
  }, code), institution && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      fontSize: 'var(--fs-micro)',
      color: 'var(--text-faint)'
    }
  }, institution)), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--fw-semibold) var(--fs-h3)/1.3 var(--font-display)',
      color: 'var(--text-heading)',
      margin: 0,
      letterSpacing: 'var(--tracking-heading)'
    }
  }, title), domain && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--text-accent)',
      marginTop: 'var(--space-4)'
    }
  }, domain), summary && /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--fw-regular) var(--fs-body-sm)/1.75 var(--font-serif)',
      color: 'var(--text-muted)',
      margin: 'var(--space-5) 0 0'
    }
  }, summary), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)',
      marginTop: 'var(--space-7)',
      paddingTop: 'var(--space-5)',
      borderTop: '1px solid var(--border-hairline)',
      font: 'var(--type-meta)',
      color: 'var(--text-muted)'
    }
  }, noteCount !== undefined && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "file-text",
    size: 12,
    color: "var(--text-faint)"
  }), noteCount, " \u7BC7\u8BB2\u4E49"), conceptCount !== undefined && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "link",
    size: 12,
    color: "var(--text-faint)"
  }), conceptCount, " \u4E2A\u6982\u5FF5"), progress && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      color: 'var(--text-faint)'
    }
  }, progress)));
}
Object.assign(__ds_scope, { CourseCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/knowledge/CourseCard.jsx", error: String((e && e.message) || e) }); }

// components/knowledge/DomainCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* One 领域 — an island group. Deep-sea tile: this is where the abyss world shows up. */
function DomainCard({
  name,
  latin,
  summary,
  courseCount,
  noteCount,
  concepts = [],
  href,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = href ? 'a' : 'div';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    "data-theme": "deep",
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest, {
    style: {
      display: 'block',
      textDecoration: 'none',
      position: 'relative',
      overflow: 'hidden',
      padding: 'var(--pad-card)',
      background: 'var(--gradient-abyss)',
      backgroundImage: 'var(--gradient-abyss), var(--texture-chart)',
      border: '1px solid ' + (hover ? 'rgba(143,198,223,.34)' : 'rgba(143,198,223,.16)'),
      borderRadius: 'var(--radius-card)',
      boxShadow: hover ? 'var(--shadow-2)' : 'var(--shadow-1)',
      transform: hover && href ? 'var(--lift-hover)' : 'none',
      transition: 'var(--transition-lift), border-color var(--dur-fast) var(--ease-tide)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map",
    size: 15,
    color: "var(--gold-400)"
  }), latin && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--gold-400)'
    }
  }, latin)), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--fw-semibold) var(--fs-h2)/1.25 var(--font-display)',
      color: 'var(--paper-50)',
      margin: 'var(--space-5) 0 0',
      letterSpacing: 'var(--tracking-heading)'
    }
  }, name), summary && /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--fw-regular) var(--fs-body-sm)/1.8 var(--font-serif)',
      color: 'var(--text-inverse-muted)',
      margin: 'var(--space-5) 0 0',
      maxWidth: '30em'
    }
  }, summary), concepts.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-4)',
      marginTop: 'var(--space-7)'
    }
  }, concepts.slice(0, 5).map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: {
      font: 'var(--fw-regular) var(--fs-micro)/1.5 var(--font-sans)',
      color: 'var(--ocean-200)',
      padding: '2px 9px',
      borderRadius: 'var(--radius-pill)',
      border: '1px dashed rgba(198,225,236,.3)'
    }
  }, c))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)',
      marginTop: 'var(--space-8)',
      paddingTop: 'var(--space-5)',
      borderTop: '1px dashed rgba(240,246,251,.28)',
      font: 'var(--type-meta)',
      color: 'var(--ocean-300)'
    }
  }, courseCount !== undefined && /*#__PURE__*/React.createElement("span", null, courseCount, " \u95E8\u8BFE\u7A0B"), courseCount !== undefined && noteCount !== undefined && /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5
    }
  }, "\xB7"), noteCount !== undefined && /*#__PURE__*/React.createElement("span", null, noteCount, " \u7BC7\u8BB2\u4E49"), href && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      color: hover ? 'var(--paper-50)' : 'var(--ocean-300)',
      transition: 'color var(--dur-fast) var(--ease-tide)'
    }
  }, "\u767B\u5C9B", /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrow-right",
    size: 13
  }))));
}
Object.assign(__ds_scope, { DomainCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/knowledge/DomainCard.jsx", error: String((e && e.message) || e) }); }

// components/knowledge/NoteCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* One 讲义. Answers "这篇在讲什么" in a summary capped at ~60 字. */
function NoteCard({
  title,
  summary,
  course,
  lecture,
  readingTime,
  concepts = [],
  href,
  updated,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, _extends({
    href: href,
    padding: "md",
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-5)'
    }
  }, lecture && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "ocean"
  }, lecture), course && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-meta)',
      color: 'var(--text-muted)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, course)), /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--fw-medium) var(--fs-h4)/1.4 var(--font-display)',
      color: 'var(--text-heading)',
      margin: 0
    }
  }, title), summary && /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--fw-regular) var(--fs-body-sm)/1.75 var(--font-serif)',
      color: 'var(--text-muted)',
      margin: 'var(--space-4) 0 0'
    }
  }, summary), concepts.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-3)',
      marginTop: 'var(--space-6)'
    }
  }, concepts.slice(0, 4).map(c => /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    key: c,
    size: "sm"
  }, c))), (readingTime || updated) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-6)',
      paddingTop: 'var(--space-5)',
      borderTop: '1px dashed var(--route-line)',
      font: 'var(--type-meta)',
      fontSize: 'var(--fs-micro)',
      color: 'var(--text-faint)'
    }
  }, readingTime && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "clock",
    size: 11
  }), readingTime), readingTime && updated && /*#__PURE__*/React.createElement("span", null, "\xB7"), updated && /*#__PURE__*/React.createElement("span", null, updated)));
}
Object.assign(__ds_scope, { NoteCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/knowledge/NoteCard.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumb.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* 领域 / 课程 / 讲义 — the reader's position in the archipelago. */
function Breadcrumb({
  items = [],
  separator = 'chevron-right',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    "aria-label": "\u9762\u5305\u5C51"
  }, rest, {
    style: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 'var(--space-3)',
      font: 'var(--type-meta)',
      ...style
    }
  }), items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: it.label + i
    }, i > 0 && (separator === 'dot' ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-faint)',
        padding: '0 2px'
      }
    }, "\xB7") : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: separator,
      size: 12,
      color: "var(--text-faint)"
    })), last || !it.href ? /*#__PURE__*/React.createElement("span", {
      "aria-current": last ? 'page' : undefined,
      style: {
        color: last ? 'var(--text-heading)' : 'var(--text-muted)',
        fontWeight: last ? 'var(--fw-medium)' : 'var(--fw-regular)'
      }
    }, it.label) : /*#__PURE__*/React.createElement("a", {
      href: it.href,
      style: {
        color: 'var(--text-muted)',
        textDecoration: 'none'
      }
    }, it.label));
  }));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SidebarNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Row({
  item,
  active,
  onSelect
}) {
  const [hover, setHover] = React.useState(false);
  const on = active === item.value;
  return /*#__PURE__*/React.createElement("a", {
    href: item.href || '#',
    onClick: e => {
      if (onSelect) {
        e.preventDefault();
        onSelect(item.value);
      }
    },
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      padding: '7px var(--space-6) 7px ' + (item.depth ? 'var(--space-10)' : 'var(--space-6)'),
      borderRadius: 'var(--radius-sm)',
      textDecoration: 'none',
      background: on ? 'var(--surface-ghost-press)' : hover ? 'var(--surface-ghost-hover)' : 'transparent',
      color: on ? 'var(--text-heading)' : hover ? 'var(--text-heading)' : 'var(--text-muted)',
      font: (on ? 'var(--fw-medium) ' : 'var(--fw-regular) ') + 'var(--fs-body-sm)/1.45 var(--font-sans)',
      boxShadow: on ? 'inset 2px 0 0 var(--accent)' : 'none',
      transition: 'var(--transition-control)'
    }
  }, item.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: item.icon,
    size: 16,
    color: on ? 'var(--accent)' : 'var(--text-faint)'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, item.label), item.count !== undefined && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--font-mono)',
      fontSize: 'var(--fs-micro)',
      color: 'var(--text-faint)'
    }
  }, item.count));
}
function SidebarNav({
  sections = [],
  active,
  onSelect,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-9)',
      ...style
    }
  }), sections.map((sec, i) => /*#__PURE__*/React.createElement("div", {
    key: sec.title || i,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }
  }, sec.title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--text-faint)',
      padding: '0 var(--space-6)',
      marginBottom: 'var(--space-4)'
    }
  }, sec.title), (sec.items || []).map(it => /*#__PURE__*/React.createElement(Row, {
    key: it.value || it.label,
    item: it,
    active: active,
    onSelect: onSelect
  })))));
}
Object.assign(__ds_scope, { SidebarNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SidebarNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TableOfContents.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Right-rail contents for a 讲义. Levels 2 and 3 only. */
function TableOfContents({
  items = [],
  active,
  onSelect,
  title = '本页目录',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(null);
  return /*#__PURE__*/React.createElement("nav", _extends({}, rest, {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      ...style
    }
  }), title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label)',
      letterSpacing: 'var(--tracking-label)',
      textTransform: 'uppercase',
      color: 'var(--text-faint)',
      marginBottom: 'var(--space-3)'
    }
  }, title), items.map(it => {
    const on = active === it.id;
    const h = hover === it.id;
    return /*#__PURE__*/React.createElement("a", {
      key: it.id,
      href: '#' + it.id,
      onClick: e => {
        if (onSelect) {
          e.preventDefault();
          onSelect(it.id);
        }
      },
      onMouseEnter: () => setHover(it.id),
      onMouseLeave: () => setHover(null),
      style: {
        display: 'block',
        textDecoration: 'none',
        paddingLeft: it.level === 3 ? 'var(--space-7)' : 'var(--space-5)',
        borderLeft: '1px solid ' + (on ? 'var(--accent)' : 'var(--border-hairline)'),
        paddingBlock: 3,
        font: (on ? 'var(--fw-medium) ' : 'var(--fw-regular) ') + 'var(--fs-meta)/1.55 var(--font-sans)',
        color: on ? 'var(--text-heading)' : h ? 'var(--text-body)' : 'var(--text-muted)',
        transition: 'var(--transition-control)'
      }
    }, it.label);
  }));
}
Object.assign(__ds_scope, { TableOfContents });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TableOfContents.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  items = [],
  value,
  defaultValue,
  onChange,
  size = 'md',
  style,
  ...rest
}) {
  const first = items.length ? typeof items[0] === 'string' ? items[0] : items[0].value : undefined;
  const [inner, setInner] = React.useState(defaultValue !== undefined ? defaultValue : first);
  const current = value !== undefined ? value : inner;
  const [hover, setHover] = React.useState(null);
  const sm = size === 'sm';
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist"
  }, rest, {
    style: {
      display: 'flex',
      gap: 'var(--space-8)',
      borderBottom: '1px solid var(--border-hairline)',
      ...style
    }
  }), items.map(raw => {
    const it = typeof raw === 'string' ? {
      value: raw,
      label: raw
    } : raw;
    const on = current === it.value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.value,
      role: "tab",
      "aria-selected": on,
      type: "button",
      onClick: () => {
        if (value === undefined) setInner(it.value);
        if (onChange) onChange(it.value);
      },
      onMouseEnter: () => setHover(it.value),
      onMouseLeave: () => setHover(null),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: sm ? '0 0 8px' : '0 0 12px',
        background: 'none',
        border: 0,
        borderBottom: '2px solid ' + (on ? 'var(--accent)' : 'transparent'),
        marginBottom: -1,
        cursor: 'pointer',
        font: 'var(--fw-medium) ' + (sm ? 'var(--fs-meta)' : 'var(--fs-body-sm)') + '/1.4 var(--font-sans)',
        color: on ? 'var(--text-heading)' : hover === it.value ? 'var(--text-heading)' : 'var(--text-muted)',
        transition: 'var(--transition-control)'
      }
    }, it.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 15
    }), it.label, it.count !== undefined && /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-mono)',
        fontSize: 'var(--fs-micro)',
        color: 'var(--text-faint)'
      }
    }, it.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/archipelago-web/AtlasHome.jsx
try { (() => {
/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  const {
    DomainCard,
    NoteCard,
    CourseCard,
    Button,
    Divider,
    Logo,
    Icon,
    Badge
  } = window.ArchipelagoDesignSystem_958ced;
  const QUESTIONS = [['这篇在讲什么', '每篇讲义开头一句摘要，先给结论的形状。'], ['需要先读什么', '前置讲义写在正文之前，不藏在页尾。'], ['接下来可以读什么', '航线指向别的岛，也指向反过来引用你的人。']];
  function Hero({
    onNav
  }) {
    return /*#__PURE__*/React.createElement("section", {
      "data-theme": "deep",
      style: {
        background: 'var(--gradient-abyss)',
        backgroundImage: 'var(--gradient-abyss), var(--texture-chart)',
        borderBottom: '1px solid rgba(143,198,223,.16)'
      }
    }, /*#__PURE__*/React.createElement(PageWidth, {
      style: {
        padding: 'var(--space-13) var(--page-gutter) var(--space-12)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 268px',
        gap: 'var(--space-12)',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-micro)',
        textTransform: 'uppercase',
        color: 'var(--gold-400)',
        marginBottom: 'var(--space-7)'
      }
    }, "\u516C\u5F00\u8BFE\u7B14\u8BB0 \xB7 \u7B2C 4 \u5E74"), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: 'var(--fw-semibold) var(--fs-display-2)/1.14 var(--font-display)',
        letterSpacing: 'var(--tracking-display)',
        color: 'var(--paper-50)',
        margin: 0,
        maxWidth: '18em'
      }
    }, "\u628A\u516C\u5F00\u8BFE\u7B14\u8BB0", /*#__PURE__*/React.createElement("br", null), "\u91CD\u65B0\u8FDE\u6210\u4E00\u5F20\u6D77\u56FE"), /*#__PURE__*/React.createElement("p", {
      style: {
        font: 'var(--fw-regular) var(--fs-lead)/1.75 var(--font-serif)',
        color: 'var(--text-inverse-muted)',
        margin: 'var(--space-8) 0 0',
        maxWidth: '26em'
      }
    }, "\u8BFE\u7A0B\u7684\u8109\u7EDC\u7559\u7740\uFF0C\u4F46\u5185\u5BB9\u6309\u9886\u57DF\u3001\u8BB2\u4E49\u3001\u6982\u5FF5\u548C\u5185\u90E8\u94FE\u63A5\u91CD\u6392\u3002\u4E0D\u540C\u5B66\u79D1\u662F\u5404\u81EA\u72EC\u7ACB\u7684\u5C9B\u5C7F\uFF0C\u94FE\u63A5\u662F\u8FDE\u63A5\u5B83\u4EEC\u7684\u822A\u7EBF\u3002"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 'var(--space-6)',
        marginTop: 'var(--space-10)'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      size: "lg",
      iconRight: "arrow-right",
      onClick: () => onNav('domain')
    }, "\u4ECE\u653F\u6CBB\u54F2\u5B66\u51FA\u53D1"), /*#__PURE__*/React.createElement(Button, {
      size: "lg",
      variant: "ghost",
      icon: "list",
      onClick: () => onNav('lecture')
    }, "\u770B\u4E00\u7BC7\u8BB2\u4E49"))), /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logo-archipelago-badge-512.png",
      alt: "Archipelago",
      style: {
        width: 268,
        height: 268,
        justifySelf: 'end'
      }
    }))));
  }
  function Questions() {
    return /*#__PURE__*/React.createElement(PageWidth, {
      style: {
        padding: 'var(--space-11) var(--page-gutter) 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: 'var(--space-10)'
      }
    }, QUESTIONS.map(([q, a], i) => /*#__PURE__*/React.createElement("div", {
      key: q,
      style: {
        paddingTop: 'var(--space-6)',
        borderTop: '1px solid var(--border-hairline)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--font-mono)',
        fontSize: 'var(--fs-micro)',
        color: 'var(--text-accent)',
        marginBottom: 'var(--space-5)'
      }
    }, '0' + (i + 1)), /*#__PURE__*/React.createElement("h3", {
      style: {
        font: 'var(--fw-medium) var(--fs-h4)/1.4 var(--font-display)',
        color: 'var(--text-heading)',
        margin: 0
      }
    }, q), /*#__PURE__*/React.createElement("p", {
      style: {
        font: 'var(--fw-regular) var(--fs-body-sm)/1.8 var(--font-serif)',
        color: 'var(--text-muted)',
        margin: 'var(--space-4) 0 0'
      }
    }, a)))));
  }
  function SectionHead({
    label,
    title,
    action,
    onAction
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'var(--space-8)',
        marginBottom: 'var(--space-8)'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
        marginBottom: 'var(--space-4)'
      }
    }, label), /*#__PURE__*/React.createElement("h2", {
      style: {
        font: 'var(--type-h2)',
        color: 'var(--text-heading)',
        margin: 0
      }
    }, title)), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        borderTop: '1px dashed var(--route-line)',
        marginBottom: 10
      }
    }), action && /*#__PURE__*/React.createElement(Button, {
      variant: "quiet",
      iconRight: "arrow-right",
      onClick: onAction
    }, action));
  }
  function AtlasHome({
    onNav,
    onOpenNote
  }) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Hero, {
      onNav: onNav
    }), /*#__PURE__*/React.createElement(Questions, null), /*#__PURE__*/React.createElement(PageWidth, {
      style: {
        padding: 'var(--space-12) var(--page-gutter) 0'
      }
    }, /*#__PURE__*/React.createElement(SectionHead, {
      label: "\u56DB\u4E2A\u5C9B\u7FA4 \xB7 FOUR ISLAND GROUPS",
      title: "\u9886\u57DF",
      action: "\u5168\u90E8\u9886\u57DF",
      onAction: () => onNav('domain')
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--grid-gap)'
      }
    }, window.DOMAINS.map(d => /*#__PURE__*/React.createElement(DomainCard, {
      key: d.id,
      name: d.name,
      latin: d.latin,
      summary: d.summary,
      concepts: d.concepts,
      courseCount: d.courseCount,
      noteCount: d.noteCount,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onNav('domain');
      }
    })))), /*#__PURE__*/React.createElement(PageWidth, {
      style: {
        padding: 'var(--space-12) var(--page-gutter) 0'
      }
    }, /*#__PURE__*/React.createElement(SectionHead, {
      label: "\u6700\u8FD1\u6574\u7406 \xB7 RECENTLY CHARTED",
      title: "\u8BB2\u4E49",
      action: "\u5168\u90E8\u8BB2\u4E49",
      onAction: () => onNav('lecture')
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3,1fr)',
        gap: 'var(--grid-gap)'
      }
    }, window.NOTES.slice(0, 3).map(n => /*#__PURE__*/React.createElement(NoteCard, {
      key: n.id,
      title: n.title,
      summary: n.summary,
      course: n.course,
      lecture: n.lecture,
      readingTime: n.readingTime,
      concepts: n.concepts,
      updated: n.updated,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenNote(n.id);
      }
    })))), /*#__PURE__*/React.createElement(PageWidth, {
      style: {
        padding: 'var(--space-12) var(--page-gutter) 0'
      }
    }, /*#__PURE__*/React.createElement(SectionHead, {
      label: "\u6B63\u5728\u8BFB \xB7 IN PROGRESS",
      title: "\u8BFE\u7A0B",
      action: "\u5168\u90E8\u8BFE\u7A0B",
      onAction: () => onNav('domain')
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--grid-gap)'
      }
    }, window.COURSES.slice(0, 2).map(c => /*#__PURE__*/React.createElement(CourseCard, {
      key: c.id,
      title: c.title,
      code: c.code,
      institution: c.institution,
      summary: c.summary,
      domain: c.domain,
      noteCount: c.noteCount,
      conceptCount: c.conceptCount,
      progress: c.progress,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onNav('domain');
      }
    })))));
  }
  Object.assign(window, {
    AtlasHome,
    SectionHead
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/archipelago-web/AtlasHome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/archipelago-web/ConceptScreen.jsx
try { (() => {
/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  const {
    Breadcrumb,
    Card,
    Tag,
    Badge,
    BacklinkList,
    NoteCard,
    Divider,
    Button,
    Icon,
    ConceptLink
  } = window.ArchipelagoDesignSystem_958ced;
  function ConceptScreen({
    label,
    onOpenNote
  }) {
    const name = label || '无知之幕';
    return /*#__PURE__*/React.createElement(PageWidth, {
      style: {
        padding: 'var(--space-10) var(--page-gutter) 0'
      }
    }, /*#__PURE__*/React.createElement(Breadcrumb, {
      items: [{
        label: '海图',
        href: '#'
      }, {
        label: '概念',
        href: '#'
      }, {
        label: name
      }]
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 300px',
        gap: 'var(--space-12)',
        marginTop: 'var(--space-8)'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-micro)',
        textTransform: 'uppercase',
        color: 'var(--text-accent)',
        marginBottom: 'var(--space-5)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "tower-control",
      size: 13
    }), "\u6982\u5FF5 \xB7 \u5730\u6807"), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: 'var(--type-h1)',
        color: 'var(--text-heading)',
        margin: 0
      }
    }, name), /*#__PURE__*/React.createElement("p", {
      style: {
        font: 'var(--type-lead)',
        color: 'var(--text-body)',
        margin: 'var(--space-7) 0 0',
        maxWidth: 'var(--measure-lead)'
      }
    }, "\u4E00\u4E2A\u7528\u4E8E\u5265\u79BB\u4E2A\u4EBA\u5904\u5883\u7684\u601D\u60F3\u88C5\u7F6E\uFF1A\u5E55\u540E\u7684\u4EBA\u77E5\u9053\u793E\u4F1A\u7684\u4E00\u822C\u4E8B\u5B9E\uFF0C\u5374\u4E0D\u77E5\u9053\u81EA\u5DF1\u4F1A\u662F\u8C01\u3002"), /*#__PURE__*/React.createElement("hr", {
      style: {
        border: 0,
        height: 1,
        background: 'linear-gradient(90deg,var(--rule-gold),transparent 82%)',
        margin: 'var(--space-9) 0'
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "ap-prose",
      style: {
        maxWidth: 'var(--measure-prose)'
      }
    }, /*#__PURE__*/React.createElement("p", null, "\u8FD9\u4E2A\u6982\u5FF5\u51FA\u73B0\u5728\u4E09\u95E8\u8BFE\u91CC\uFF0C\u4F46\u7528\u6CD5\u5E76\u4E0D\u76F8\u540C\u3002\u5728\u653F\u6CBB\u54F2\u5B66\u91CC\u5B83\u662F\u4E00\u4E2A\u6B63\u5F53\u5316\u7A0B\u5E8F\uFF1B\u5728\u535A\u5F08\u8BBA\u91CC\u5B83\u88AB\u8BFB\u4F5C\u4E00\u79CD\u98CE\u9669\u6001\u5EA6\uFF1B\u5728\u7ECF\u6D4E\u5B66\u7684\u5206\u914D\u8BA8\u8BBA\u4E2D\uFF0C\u5B83\u5E38\u5E38\u88AB\u7B80\u5316\u6210\u300C\u4EE3\u8868\u6027\u4E2A\u4F53\u300D\u3002"), /*#__PURE__*/React.createElement("p", null, "\u5982\u679C\u53EA\u8BB0\u4E00\u53E5\u8BDD\uFF1A\u5B83\u6392\u9664\u7684\u4E0D\u662F\u6B32\u671B\uFF0C\u800C\u662F", /*#__PURE__*/React.createElement("strong", {
      style: {
        fontWeight: 'var(--fw-semibold)',
        color: 'var(--text-heading)'
      }
    }, "\u300C\u56E0\u4E3A\u6211\u6070\u597D\u662F\u6211\u300D"), "\u8FD9\u4E2A\u7406\u7531\u3002")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
        margin: 'var(--space-10) 0 var(--space-7)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--text-muted)'
      }
    }, "\u51FA\u73B0\u5728"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        borderTop: '1px dashed var(--route-line)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-micro)',
        color: 'var(--text-faint)'
      }
    }, "3")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--grid-gap)'
      }
    }, window.NOTES.slice(0, 2).map(n => /*#__PURE__*/React.createElement(NoteCard, {
      key: n.id,
      title: n.title,
      summary: n.summary,
      course: n.course,
      lecture: n.lecture,
      readingTime: n.readingTime,
      concepts: n.concepts,
      updated: n.updated,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenNote(n.id);
      }
    }))), /*#__PURE__*/React.createElement("hr", {
      style: {
        border: 0,
        borderTop: '1px dashed var(--route-line)',
        margin: 'var(--space-11) 0 var(--space-9)'
      }
    }), /*#__PURE__*/React.createElement(BacklinkList, {
      items: window.BACKLINKS
    })), /*#__PURE__*/React.createElement("aside", {
      style: {
        position: 'sticky',
        top: 'calc(var(--header-h) + var(--space-9))',
        alignSelf: 'start'
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: "md"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
        marginBottom: 'var(--space-5)'
      }
    }, "\u5750\u6807"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        font: 'var(--type-meta)',
        color: 'var(--text-body)'
      }
    }, [['领域', '政治哲学'], ['首次出现', '正义论导读 · 第 3 讲'], ['被引用', '11 次'], ['相邻概念', '4 个']].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 'var(--space-6)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-faint)'
      }
    }, k), /*#__PURE__*/React.createElement("span", null, v))))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 'var(--space-9)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
        marginBottom: 'var(--space-6)'
      }
    }, "\u76F8\u90BB\u5730\u6807"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-3)'
      }
    }, ['原初状态', '差别原则', '持有正义', '重叠共识'].map(c => /*#__PURE__*/React.createElement(Tag, {
      key: c,
      size: "sm",
      href: "#"
    }, c)))))));
  }
  Object.assign(window, {
    ConceptScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/archipelago-web/ConceptScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/archipelago-web/DomainScreen.jsx
try { (() => {
/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  const {
    Breadcrumb,
    Tabs,
    SidebarNav,
    CourseCard,
    NoteCard,
    Tag,
    Divider,
    Badge,
    Icon,
    Button
  } = window.ArchipelagoDesignSystem_958ced;
  function DomainScreen({
    onNav,
    onOpenNote,
    onOpenConcept
  }) {
    const [tab, setTab] = React.useState('courses');
    const domain = window.DOMAINS[0];
    const courses = window.COURSES.filter(c => c.domain === domain.name);
    const notes = window.NOTES.filter(n => courses.some(c => c.title === n.course));
    return /*#__PURE__*/React.createElement(PageWidth, {
      style: {
        padding: 'var(--space-10) var(--page-gutter) 0'
      }
    }, /*#__PURE__*/React.createElement(Breadcrumb, {
      items: [{
        label: '海图',
        href: '#'
      }, {
        label: '领域',
        href: '#'
      }, {
        label: domain.name
      }]
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 'var(--space-12)',
        marginTop: 'var(--space-8)'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-micro)',
        textTransform: 'uppercase',
        color: 'var(--text-accent)',
        marginBottom: 'var(--space-5)'
      }
    }, domain.latin), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: 'var(--type-h1)',
        color: 'var(--text-heading)',
        margin: 0
      }
    }, domain.name), /*#__PURE__*/React.createElement("p", {
      style: {
        font: 'var(--type-lead)',
        color: 'var(--text-muted)',
        margin: 'var(--space-7) 0 0',
        maxWidth: 'var(--measure-lead)'
      }
    }, domain.summary), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 'var(--space-7)',
        marginTop: 'var(--space-8)',
        font: 'var(--type-meta)',
        color: 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement("span", null, domain.courseCount, " \u95E8\u8BFE\u7A0B"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-faint)'
      }
    }, "\xB7"), /*#__PURE__*/React.createElement("span", null, domain.noteCount, " \u7BC7\u8BB2\u4E49"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-faint)'
      }
    }, "\xB7"), /*#__PURE__*/React.createElement("span", null, domain.concepts.length * 9, " \u4E2A\u6982\u5FF5")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 'var(--space-10)'
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      value: tab,
      onChange: setTab,
      items: [{
        value: 'courses',
        label: '课程',
        count: courses.length
      }, {
        value: 'notes',
        label: '讲义',
        count: domain.noteCount
      }, {
        value: 'concepts',
        label: '概念',
        count: 36
      }]
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--grid-gap)',
        marginTop: 'var(--space-9)'
      }
    }, tab === 'courses' && courses.map(c => /*#__PURE__*/React.createElement(CourseCard, {
      key: c.id,
      title: c.title,
      code: c.code,
      institution: c.institution,
      summary: c.summary,
      domain: c.domain,
      noteCount: c.noteCount,
      conceptCount: c.conceptCount,
      progress: c.progress,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onNav('lecture');
      }
    })), tab === 'notes' && notes.map(n => /*#__PURE__*/React.createElement(NoteCard, {
      key: n.id,
      title: n.title,
      summary: n.summary,
      course: n.course,
      lecture: n.lecture,
      readingTime: n.readingTime,
      concepts: n.concepts,
      updated: n.updated,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenNote(n.id);
      }
    })), tab === 'concepts' && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-4)'
      }
    }, ['无知之幕', '原初状态', '分配正义', '自然状态', '消极自由', '积极自由', '持有正义', '自我所有', '公共理性', '重叠共识', '差别原则', '能力路径'].map(c => /*#__PURE__*/React.createElement(Tag, {
      key: c,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenConcept(c);
      }
    }, c))))), /*#__PURE__*/React.createElement("aside", {
      style: {
        position: 'sticky',
        top: 'calc(var(--header-h) + var(--space-9))',
        alignSelf: 'start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
        marginBottom: 'var(--space-6)'
      }
    }, "\u5C9B\u7FA4 \xB7 \u5176\u4ED6\u9886\u57DF"), /*#__PURE__*/React.createElement(SidebarNav, {
      active: "pp",
      onSelect: () => {},
      sections: [{
        items: window.DOMAINS.map(d => ({
          value: d.id,
          label: d.name,
          icon: 'map',
          count: d.courseCount
        }))
      }],
      style: {
        marginLeft: 'calc(var(--space-6) * -1)'
      }
    }), /*#__PURE__*/React.createElement("hr", {
      style: {
        border: 0,
        borderTop: '1px dashed var(--route-line)',
        margin: 'var(--space-9) 0'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
        marginBottom: 'var(--space-6)'
      }
    }, "\u8FD9\u7247\u6D77\u57DF\u7684\u5730\u6807"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-3)'
      }
    }, domain.concepts.map(c => /*#__PURE__*/React.createElement(Tag, {
      key: c,
      size: "sm",
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenConcept(c);
      }
    }, c))))));
  }
  Object.assign(window, {
    DomainScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/archipelago-web/DomainScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/archipelago-web/LectureScreen.jsx
try { (() => {
/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  const {
    Breadcrumb,
    SidebarNav,
    TableOfContents,
    Callout,
    ConceptLink,
    BacklinkList,
    Tag,
    Badge,
    Button,
    IconButton,
    Divider,
    Tooltip,
    Icon,
    Card
  } = window.ArchipelagoDesignSystem_958ced;
  function Meta() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-6)',
        font: 'var(--type-meta)',
        color: 'var(--text-muted)'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      tone: "ocean"
    }, "\u7B2C 3 \u8BB2"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--fs-micro)'
      }
    }, "ER 22 \xB7 Harvard"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-faint)'
      }
    }, "\xB7"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "clock",
      size: 12,
      color: "var(--text-faint)"
    }), "\u7EA6 12 \u5206\u949F"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-faint)'
      }
    }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "\u4E09\u5929\u524D\u66F4\u65B0"));
  }
  function LectureScreen({
    onOpenConcept,
    onLog
  }) {
    const [active, setActive] = React.useState('veil');
    const concept = (label, summary, source) => /*#__PURE__*/React.createElement(ConceptLink, {
      label: label,
      summary: summary,
      source: source,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenConcept(label);
      }
    });
    return /*#__PURE__*/React.createElement(PageWidth, {
      style: {
        padding: 'var(--space-10) var(--page-gutter) 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'var(--rail-left) minmax(0,1fr) var(--rail-right)',
        gap: 'var(--space-11)'
      }
    }, /*#__PURE__*/React.createElement("aside", {
      style: {
        position: 'sticky',
        top: 'calc(var(--header-h) + var(--space-9))',
        alignSelf: 'start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
        marginBottom: 'var(--space-6)',
        paddingLeft: 'var(--space-6)'
      }
    }, "\u6B63\u4E49\u8BBA\u5BFC\u8BFB"), /*#__PURE__*/React.createElement(SidebarNav, {
      active: "veil",
      onSelect: () => {},
      sections: [{
        items: window.COURSE_LECTURES
      }]
    }), /*#__PURE__*/React.createElement("hr", {
      style: {
        border: 0,
        borderTop: '1px dashed var(--route-line)',
        margin: 'var(--space-9) var(--space-6)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingLeft: 'var(--space-6)'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      icon: "compass",
      onClick: onLog
    }, "\u52A0\u5165\u822A\u6D77\u65E5\u5FD7"))), /*#__PURE__*/React.createElement("article", null, /*#__PURE__*/React.createElement(Breadcrumb, {
      items: [{
        label: '政治哲学',
        href: '#'
      }, {
        label: '正义论导读',
        href: '#'
      }, {
        label: '无知之幕'
      }]
    }), /*#__PURE__*/React.createElement("h1", {
      style: {
        font: 'var(--type-h1)',
        color: 'var(--text-heading)',
        margin: 'var(--space-7) 0 var(--space-6)'
      }
    }, "\u65E0\u77E5\u4E4B\u5E55"), /*#__PURE__*/React.createElement(Meta, null), /*#__PURE__*/React.createElement("hr", {
      style: {
        border: 0,
        height: 1,
        background: 'linear-gradient(90deg,var(--rule-gold),transparent 82%)',
        margin: 'var(--space-8) 0 var(--space-8)'
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        font: 'var(--fw-regular) var(--fs-lead)/1.75 var(--font-serif)',
        color: 'var(--text-body)',
        margin: 0,
        maxWidth: 'var(--measure-lead)'
      }
    }, "\u8FD9\u7BC7\u8BB2\u4E49\u68B3\u7406\u7F57\u5C14\u65AF\u7684\u300C\u65E0\u77E5\u4E4B\u5E55\u300D\uFF0C\u4EE5\u53CA\u5B83\u4E3A\u4EC0\u4E48\u4E0D\u662F\u4E00\u4E2A\u601D\u60F3\u5B9E\u9A8C\u7684\u7EC8\u70B9\u3002"), /*#__PURE__*/React.createElement("div", {
      style: {
        margin: 'var(--space-9) 0'
      }
    }, /*#__PURE__*/React.createElement(Callout, {
      kind: "prereq"
    }, "\u5148\u8BFB", /*#__PURE__*/React.createElement(ConceptLink, {
      label: "\u793E\u4F1A\u5951\u7EA6\u7684\u4E09\u79CD\u7248\u672C",
      href: "#",
      summary: "\u970D\u5E03\u65AF\u3001\u6D1B\u514B\u3001\u5362\u68AD\uFF1A\u540C\u4E00\u4E2A\u88C5\u7F6E\uFF0C\u4E09\u79CD\u4E0D\u540C\u7684\u51FA\u53D1\u70B9\u3002",
      source: "\u6B63\u4E49\u8BBA\u5BFC\u8BFB \xB7 \u7B2C 2 \u8BB2"
    }, "\u300A\u793E\u4F1A\u5951\u7EA6\u7684\u4E09\u79CD\u7248\u672C\u300B"), "\uFF0C\u8FD9\u4E00\u8BB2\u9ED8\u8BA4\u4F60\u5DF2\u7ECF\u63A5\u53D7\u4E86\u5951\u7EA6\u8BBA\u7684\u63D0\u95EE\u65B9\u5F0F\u3002")), /*#__PURE__*/React.createElement("div", {
      className: "ap-prose",
      style: {
        maxWidth: 'var(--measure-prose)'
      }
    }, /*#__PURE__*/React.createElement("h2", {
      id: "setup"
    }, "\u95EE\u9898\u7684\u8BBE\u7F6E"), /*#__PURE__*/React.createElement("p", null, "\u529F\u5229\u4E3B\u4E49\u628A\u6B63\u4E49\u4EA4\u7ED9\u4E00\u4E2A\u52A0\u603B\uFF1A\u53EA\u8981\u603B\u91CF\u6700\u5927\uFF0C\u5206\u914D\u65B9\u5F0F\u53EF\u4EE5\u518D\u8C08\u3002\u7F57\u5C14\u65AF\u4E0D\u63A5\u53D7\u8FD9\u4E2A\u8BA9\u6B65\uFF0C\u4E8E\u662F\u4ED6\u9700\u8981\u4E00\u4E2A\u65B0\u7684\u51FA\u53D1\u70B9\u2014\u2014\u4E00\u4E2A\u80FD\u8BA9\u4EBA\u5728\u4E0D\u77E5\u9053\u81EA\u5DF1\u662F\u8C01\u7684\u60C5\u51B5\u4E0B\uFF0C\u4ECD\u7136\u613F\u610F\u7B7E\u5B57\u7684\u7A0B\u5E8F\u3002"), /*#__PURE__*/React.createElement("h3", {
      id: "veil"
    }, "\u65E0\u77E5\u4E4B\u5E55\u662F\u4EC0\u4E48"), /*#__PURE__*/React.createElement("p", null, concept('无知之幕', '一个用于剥离个人处境的思想装置，而不是一个结论。', '正义论导读 · 第 3 讲'), "\u5E76\u4E0D\u662F\u8BA9\u4EBA\u53D8\u6210\u7A7A\u767D\u3002\u5E55\u540E\u7684\u4EBA\u77E5\u9053\u793E\u4F1A\u7684\u4E00\u822C\u4E8B\u5B9E\uFF1A\u7ECF\u6D4E\u5B66\u3001\u5FC3\u7406\u5B66\u3001\u7A00\u7F3A\u3002\u4ED6\u4EEC\u552F\u72EC\u4E0D\u77E5\u9053\u81EA\u5DF1\u4F1A\u843D\u5728\u54EA\u91CC\u2014\u2014\u6027\u522B\u3001\u9636\u5C42\u3001\u5929\u8D4B\u3001\u4E43\u81F3\u5BF9\u597D\u751F\u6D3B\u7684\u5177\u4F53\u60F3\u6CD5\u3002"), /*#__PURE__*/React.createElement("p", null, "\u8FD9\u5C42\u906E\u853D\u505A\u7684\u662F\u4E00\u6B21\u89C6\u89D2\u7684\u7F6E\u6362\uFF1A\u95EE\u9898\u4ECE\u300C\u6211\u60F3\u8981\u4EC0\u4E48\u300D\u53D8\u6210\u300C\u4EFB\u4F55\u4EBA\u90FD\u80FD\u63A5\u53D7\u4EC0\u4E48\u300D\u3002\u5B83\u628A\u504F\u79C1\u5265\u6389\u7684\u65B9\u5F0F\uFF0C\u4E0D\u662F\u8981\u6C42\u4EBA\u53D8\u5F97\u9AD8\u5C1A\uFF0C\u800C\u662F\u8BA9\u504F\u79C1\u5931\u53BB\u53EF\u7528\u7684\u4FE1\u606F\u3002"), /*#__PURE__*/React.createElement("blockquote", null, "\u6B63\u4E49\u7684\u539F\u5219\u5E94\u5F53\u5728\u4E00\u79CD\u6CA1\u4EBA\u80FD\u4E3A\u81EA\u5DF1\u91CF\u8EAB\u5B9A\u505A\u7684\u5904\u5883\u4E2D\u88AB\u9009\u51FA\u3002"), /*#__PURE__*/React.createElement("h3", {
      id: "orig"
    }, "\u539F\u521D\u72B6\u6001\u91CC\u7684\u4EBA"), /*#__PURE__*/React.createElement("p", null, concept('原初状态', '幕后的选择处境：一般知识充分，个人信息为零。', '正义论导读 · 第 3 讲'), "\u4E2D\u7684\u7ACB\u7EA6\u8005\u662F\u7406\u6027\u4E14\u4E92\u4E0D\u5173\u5FC3\u7684\uFF1A\u4ED6\u4EEC\u4E0D\u5AC9\u5992\uFF0C\u4E5F\u4E0D\u5229\u4ED6\uFF0C\u53EA\u60F3\u8BA9\u81EA\u5DF1\uFF08\u65E0\u8BBA\u6700\u540E\u662F\u8C01\uFF09\u8FC7\u5F97\u4E0D\u7B97\u5DEE\u3002\u8FD9\u4E2A\u8BBE\u5B9A\u540E\u6765\u88AB\u5927\u91CF\u6279\u8BC4\uFF0C\u4E5F\u88AB\u5927\u91CF\u501F\u7528\u2014\u2014", concept('博弈论', '当结果取决于别人怎么选，理性本身就变成了一个结构问题。', '博弈论 · 第 4 讲'), "\u90A3\u8FB9\u4F1A\u628A\u5B83\u8BFB\u6210\u4E00\u79CD\u6781\u7AEF\u7684\u98CE\u9669\u6001\u5EA6\u3002"), /*#__PURE__*/React.createElement("h2", {
      id: "why"
    }, "\u4E3A\u4EC0\u4E48\u9700\u8981\u8FD9\u5C42\u906E\u853D"), /*#__PURE__*/React.createElement("p", null, "\u5982\u679C\u5141\u8BB8\u7ACB\u7EA6\u8005\u77E5\u9053\u81EA\u5DF1\u7684\u4F4D\u7F6E\uFF0C\u4EFB\u4F55\u539F\u5219\u90FD\u4F1A\u9000\u5316\u6210\u4E00\u6B21\u8C08\u5224\uFF1A\u5F3A\u8005\u8981\u6C42\u66F4\u5C11\u7684\u518D\u5206\u914D\uFF0C\u5F31\u8005\u8981\u6C42\u66F4\u591A\u3002\u906E\u853D\u7684\u4F5C\u7528\u4E0D\u662F\u4EA7\u751F\u5171\u8BC6\uFF0C\u800C\u662F\u8BA9\u5171\u8BC6\u53D8\u5F97\u6709\u610F\u4E49\u2014\u2014\u5B83\u6392\u9664\u4E86\u300C\u56E0\u4E3A\u6211\u6070\u597D\u662F\u6211\u300D\u8FD9\u4E2A\u7406\u7531\u3002"), /*#__PURE__*/React.createElement("h2", {
      id: "crit"
    }, "\u4E24\u79CD\u53CD\u9A73"), /*#__PURE__*/React.createElement("p", null, "\u7B2C\u4E00\u79CD\u6765\u81EA", concept('持有正义', '正义不在于结果的分布，而在于取得过程是否正当。', '正义论导读 · 第 5 讲'), "\uFF1A\u8BFA\u9F50\u514B\u8BA4\u4E3A\u300C\u5206\u914D\u300D\u8FD9\u4E2A\u63D0\u6CD5\u672C\u8EAB\u5DF2\u7ECF\u5047\u5B9A\u4E86\u6709\u4E00\u4E2A\u53EF\u4F9B\u5206\u914D\u7684\u603B\u91CF\u3002\u7B2C\u4E8C\u79CD\u6765\u81EA\u793E\u7FA4\u4E3B\u4E49\uFF1A\u5E55\u540E\u90A3\u4E2A\u4E0D\u77E5\u9053\u81EA\u5DF1\u770B\u91CD\u4EC0\u4E48\u7684\u4EBA\uFF0C\u662F\u5426\u8FD8\u7B97\u4E00\u4E2A\u4EBA\uFF1F")), /*#__PURE__*/React.createElement("div", {
      style: {
        margin: 'var(--space-10) 0 0'
      }
    }, /*#__PURE__*/React.createElement(Callout, {
      kind: "next"
    }, "\u63A5\u4E0B\u6765\u53EF\u4EE5\u8BFB", /*#__PURE__*/React.createElement(ConceptLink, {
      label: "\u8BFA\u9F50\u514B\u7684\u53CD\u9A73",
      href: "#",
      summary: "\u6301\u6709\u6B63\u4E49\u8BBA\u5982\u4F55\u628A\u300C\u5206\u914D\u300D\u8FD9\u4E2A\u63D0\u6CD5\u672C\u8EAB\u5F53\u6210\u95EE\u9898\u3002",
      source: "\u6B63\u4E49\u8BBA\u5BFC\u8BFB \xB7 \u7B2C 5 \u8BB2"
    }, "\u8BFA\u9F50\u514B\u7684\u53CD\u9A73"), "\uFF0C\u6216\u8005\u8DF3\u5230\u5206\u914D\u6B63\u4E49\u7684\u7ECF\u6D4E\u5B66\u4E00\u4FA7\u3002")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 'var(--space-6)',
        marginTop: 'var(--space-9)'
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      icon: "arrow-left"
    }, "\u7B2C 2 \u8BB2 \xB7 \u5951\u7EA6\u8BBA\u7684\u590D\u6D3B"), /*#__PURE__*/React.createElement(Button, {
      iconRight: "arrow-right"
    }, "\u7B2C 4 \u8BB2 \xB7 \u4E24\u4E2A\u6B63\u4E49\u539F\u5219")), /*#__PURE__*/React.createElement("hr", {
      style: {
        border: 0,
        borderTop: '1px dashed var(--route-line)',
        margin: 'var(--space-11) 0 var(--space-9)'
      }
    }), /*#__PURE__*/React.createElement(BacklinkList, {
      items: window.BACKLINKS
    })), /*#__PURE__*/React.createElement("aside", {
      style: {
        position: 'sticky',
        top: 'calc(var(--header-h) + var(--space-9))',
        alignSelf: 'start'
      }
    }, /*#__PURE__*/React.createElement(TableOfContents, {
      items: window.LECTURE_TOC,
      active: active,
      onSelect: setActive
    }), /*#__PURE__*/React.createElement("hr", {
      style: {
        border: 0,
        borderTop: '1px dashed var(--route-line)',
        margin: 'var(--space-9) 0'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--text-faint)',
        marginBottom: 'var(--space-6)'
      }
    }, "\u672C\u9875\u6982\u5FF5"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-3)'
      }
    }, ['无知之幕', '原初状态', '持有正义', '分配正义'].map(c => /*#__PURE__*/React.createElement(Tag, {
      key: c,
      size: "sm",
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenConcept(c);
      }
    }, c))), /*#__PURE__*/React.createElement("hr", {
      style: {
        border: 0,
        borderTop: '1px dashed var(--route-line)',
        margin: 'var(--space-9) 0'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 'var(--space-4)'
      }
    }, /*#__PURE__*/React.createElement(Tooltip, {
      content: "\u590D\u5236\u94FE\u63A5"
    }, /*#__PURE__*/React.createElement(IconButton, {
      icon: "link",
      label: "\u590D\u5236\u94FE\u63A5",
      variant: "outline",
      size: "sm"
    })), /*#__PURE__*/React.createElement(Tooltip, {
      content: "\u539F\u8BFE\u7A0B\u9875"
    }, /*#__PURE__*/React.createElement(IconButton, {
      icon: "external-link",
      label: "\u539F\u8BFE\u7A0B\u9875",
      variant: "outline",
      size: "sm"
    })), /*#__PURE__*/React.createElement(Tooltip, {
      content: "\u52A0\u5165\u65E5\u5FD7"
    }, /*#__PURE__*/React.createElement(IconButton, {
      icon: "compass",
      label: "\u52A0\u5165\u65E5\u5FD7",
      variant: "outline",
      size: "sm",
      onClick: onLog
    }))))));
  }
  Object.assign(window, {
    LectureScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/archipelago-web/LectureScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/archipelago-web/SearchOverlay.jsx
try { (() => {
/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  const {
    Input,
    Badge,
    Tag,
    Icon,
    Divider
  } = window.ArchipelagoDesignSystem_958ced;
  const GROUPS = [{
    label: '讲义',
    icon: 'file-text',
    items: [['无知之幕', '正义论导读 · 第 3 讲'], ['诺齐克的反驳', '正义论导读 · 第 5 讲'], ['摊还分析', '算法导论 · 第 7 讲']]
  }, {
    label: '概念',
    icon: 'tower-control',
    items: [['原初状态', '政治哲学 · 被引用 7 次'], ['分配正义', '政治哲学 · 被引用 14 次']]
  }, {
    label: '课程',
    icon: 'book-open',
    items: [['正义论导读', 'Harvard ER 22 · 12 篇讲义'], ['博弈论', 'Yale ECON 159 · 16 篇讲义']]
  }];
  function SearchOverlay({
    open,
    onClose,
    onPick
  }) {
    const [q, setQ] = React.useState('无知');
    if (!open) return null;
    return /*#__PURE__*/React.createElement("div", {
      onClick: e => {
        if (e.target === e.currentTarget) onClose();
      },
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'var(--surface-scrim)',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '12vh'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 620,
        maxHeight: '70vh',
        overflow: 'auto',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 'var(--space-7) var(--space-7) var(--space-6)',
        borderBottom: '1px solid var(--border-hairline)'
      }
    }, /*#__PURE__*/React.createElement(Input, {
      icon: "search",
      value: q,
      onChange: e => setQ(e.target.value),
      autoFocus: true,
      placeholder: "\u641C\u7D22\u8BB2\u4E49\u3001\u6982\u5FF5\u3001\u8BFE\u7A0B",
      suffix: "ESC \u5173\u95ED",
      size: "lg"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 'var(--space-6) 0 var(--space-7)'
      }
    }, GROUPS.map(g => /*#__PURE__*/React.createElement("div", {
      key: g.label,
      style: {
        marginBottom: 'var(--space-7)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: '0 var(--space-7)',
        marginBottom: 'var(--space-4)',
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--text-faint)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: g.icon,
      size: 12
    }), g.label), g.items.map(([title, meta]) => /*#__PURE__*/React.createElement(Row, {
      key: title,
      title: title,
      meta: meta,
      onPick: onPick
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 'var(--space-5) var(--space-7) 0',
        borderTop: '1px dashed var(--route-line)',
        display: 'flex',
        gap: 'var(--space-7)',
        font: 'var(--type-meta)',
        fontSize: 'var(--fs-micro)',
        color: 'var(--text-faint)'
      }
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)'
      }
    }, "\u2191\u2193"), " \u79FB\u52A8"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)'
      }
    }, "\u21B5"), " \u6253\u5F00"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)'
      }
    }, "\u2318K"), " \u547C\u51FA")))));
  }
  function Row({
    title,
    meta,
    onPick
  }) {
    const [hover, setHover] = React.useState(false);
    return /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onPick(title);
      },
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 'var(--space-6)',
        padding: '9px var(--space-7)',
        textDecoration: 'none',
        background: hover ? 'var(--surface-ghost-hover)' : 'transparent',
        boxShadow: hover ? 'inset 2px 0 0 var(--accent)' : 'none',
        transition: 'var(--transition-control)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--fw-medium) var(--fs-body-sm)/1.5 var(--font-display)',
        color: 'var(--text-heading)'
      }
    }, title), /*#__PURE__*/React.createElement("span", {
      style: {
        font: 'var(--type-meta)',
        fontSize: 'var(--fs-micro)',
        color: 'var(--text-faint)'
      }
    }, meta));
  }
  Object.assign(window, {
    SearchOverlay
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/archipelago-web/SearchOverlay.jsx", error: String((e && e.message) || e) }); }

// ui_kits/archipelago-web/Shell.jsx
try { (() => {
/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  const {
    Logo,
    IconButton,
    Tooltip,
    Input,
    Divider
  } = window.ArchipelagoDesignSystem_958ced;
  const NAV = [{
    id: 'home',
    label: '海图'
  }, {
    id: 'domain',
    label: '领域'
  }, {
    id: 'lecture',
    label: '讲义'
  }, {
    id: 'concept',
    label: '概念'
  }];
  function Header({
    view,
    onNav,
    onSearch
  }) {
    return /*#__PURE__*/React.createElement("header", {
      style: {
        position: 'sticky',
        top: 0,
        zIndex: 30,
        height: 'var(--header-h)',
        background: 'var(--surface-page)',
        borderBottom: '1px solid var(--border-hairline)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 'var(--page-max)',
        margin: '0 auto',
        height: '100%',
        padding: '0 var(--page-gutter)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-10)'
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onNav('home');
      },
      style: {
        textDecoration: 'none'
      }
    }, /*#__PURE__*/React.createElement(Logo, {
      src: "../../assets/logo-archipelago-badge-256.png",
      size: 34,
      showCn: false
    })), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: 'flex',
        gap: 'var(--space-8)',
        flex: 1
      }
    }, NAV.map(n => {
      const on = view === n.id;
      return /*#__PURE__*/React.createElement("a", {
        key: n.id,
        href: "#",
        onClick: e => {
          e.preventDefault();
          onNav(n.id);
        },
        style: {
          textDecoration: 'none',
          paddingBottom: 2,
          borderBottom: '2px solid ' + (on ? 'var(--accent)' : 'transparent'),
          font: (on ? 'var(--fw-medium) ' : 'var(--fw-regular) ') + 'var(--fs-body-sm)/1.4 var(--font-sans)',
          color: on ? 'var(--text-heading)' : 'var(--text-muted)'
        }
      }, n.label);
    })), /*#__PURE__*/React.createElement("div", {
      onClick: onSearch,
      style: {
        width: 232,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Input, {
      icon: "search",
      placeholder: "\u641C\u7D22\u8BB2\u4E49\u3001\u6982\u5FF5\u3001\u8BFE\u7A0B",
      suffix: "\u2318K",
      size: "sm",
      readOnly: true,
      style: {
        cursor: 'pointer'
      }
    })), /*#__PURE__*/React.createElement(Tooltip, {
      content: "\u822A\u6D77\u65E5\u5FD7"
    }, /*#__PURE__*/React.createElement(IconButton, {
      icon: "compass",
      label: "\u822A\u6D77\u65E5\u5FD7"
    }))));
  }
  function Footer() {
    return /*#__PURE__*/React.createElement("footer", {
      "data-theme": "deep",
      style: {
        marginTop: 'var(--space-13)',
        background: 'var(--gradient-abyss)',
        backgroundImage: 'var(--gradient-abyss), var(--texture-chart)',
        padding: 'var(--space-12) 0 var(--space-11)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 'var(--page-max)',
        margin: '0 auto',
        padding: '0 var(--page-gutter)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: 'var(--space-11)',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: '28em'
      }
    }, /*#__PURE__*/React.createElement(Logo, {
      src: "../../assets/logo-archipelago-badge-256.png",
      size: 44,
      tone: "inverse"
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        font: 'var(--fw-regular) var(--fs-body-sm)/1.85 var(--font-serif)',
        color: 'var(--text-inverse-muted)',
        margin: 'var(--space-7) 0 0'
      }
    }, "\u4E0D\u540C\u5B66\u79D1\u662F\u5404\u81EA\u72EC\u7ACB\u7684\u5C9B\u5C7F\uFF0C\u5185\u90E8\u94FE\u63A5\u548C\u77E5\u8BC6\u5173\u7CFB\u5219\u662F\u8FDE\u63A5\u5B83\u4EEC\u7684\u822A\u7EBF\u3002")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 'var(--space-12)'
      }
    }, [['航行', ['全部领域', '全部课程', '概念索引']], ['关于', ['这个项目', '如何记笔记', '订阅更新']]].map(([title, items]) => /*#__PURE__*/React.createElement("div", {
      key: title
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: 'var(--type-label)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--gold-400)',
        marginBottom: 'var(--space-6)'
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)'
      }
    }, items.map(i => /*#__PURE__*/React.createElement("a", {
      key: i,
      href: "#",
      style: {
        font: 'var(--type-meta)',
        color: 'var(--ocean-300)',
        textDecoration: 'none'
      }
    }, i))))))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 'var(--space-11)',
        paddingTop: 'var(--space-6)',
        borderTop: '1px dashed var(--route-line-inverse)',
        display: 'flex',
        justifyContent: 'space-between',
        font: 'var(--type-meta)',
        fontSize: 'var(--fs-micro)',
        color: 'var(--text-faint)'
      }
    }, /*#__PURE__*/React.createElement("span", null, "Archipelago \u7FA4\u5C9B \xB7 \u516C\u5F00\u8BFE\u7B14\u8BB0"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)'
      }
    }, "154 \u7BC7\u8BB2\u4E49 \xB7 11 \u95E8\u8BFE\u7A0B \xB7 4 \u4E2A\u9886\u57DF"))));
  }
  function Shell({
    view,
    onNav,
    onSearch,
    children
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100%',
        background: 'var(--surface-page)',
        backgroundImage: 'var(--texture-paper)'
      }
    }, /*#__PURE__*/React.createElement(Header, {
      view: view,
      onNav: onNav,
      onSearch: onSearch
    }), /*#__PURE__*/React.createElement("main", null, children), /*#__PURE__*/React.createElement(Footer, null));
  }
  function PageWidth({
    children,
    style
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 'var(--page-max)',
        margin: '0 auto',
        padding: '0 var(--page-gutter)',
        ...style
      }
    }, children);
  }
  Object.assign(window, {
    Shell,
    Header,
    Footer,
    PageWidth
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/archipelago-web/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/archipelago-web/data.jsx
try { (() => {
/* Wrapped in an IIFE: every text/babel script in this kit shares one top-level
   scope, so bare consts would collide across files. Exports go on window. */
(() => {
  /* Sample content for the Archipelago kit. Public courses, plausible Chinese notes. */
  const DOMAINS = [{
    id: 'pp',
    name: '政治哲学',
    latin: 'Political philosophy',
    summary: '从社会契约到分配正义：这片海域关心的是权力凭什么正当。',
    concepts: ['无知之幕', '自然状态', '分配正义', '消极自由'],
    courseCount: 3,
    noteCount: 46
  }, {
    id: 'sys',
    name: '计算机系统',
    latin: 'Computer systems',
    summary: '把机器拆到能重装回去：从算法的代价一路读到操作系统的取舍。',
    concepts: ['摊还分析', '虚拟内存', '缓存一致性'],
    courseCount: 4,
    noteCount: 61
  }, {
    id: 'econ',
    name: '经济学',
    latin: 'Economics',
    summary: '价格是一种信息，博弈是一种结构。两者都在解释人为什么这样选。',
    concepts: ['纳什均衡', '信息不对称', '机制设计'],
    courseCount: 2,
    noteCount: 28
  }, {
    id: 'mind',
    name: '认知科学',
    latin: 'Cognitive science',
    summary: '大脑既是器官也是模型。这片海域在两种描述之间来回航行。',
    concepts: ['预测编码', '工作记忆', '双系统'],
    courseCount: 2,
    noteCount: 19
  }];
  const COURSES = [{
    id: 'justice',
    domain: '政治哲学',
    code: 'ER 22',
    institution: 'Harvard',
    title: '正义论导读',
    summary: '从功利主义到罗尔斯，十二讲的主线与分歧。',
    noteCount: 12,
    conceptCount: 31,
    progress: '已整理 8 / 12'
  }, {
    id: 'liberty',
    domain: '政治哲学',
    code: 'PHIL 181',
    institution: 'Yale',
    title: '自由的两种概念',
    summary: '伯林那篇演讲之后，「自由」这个词分裂成了两条航线。',
    noteCount: 9,
    conceptCount: 18,
    progress: '已整理 9 / 9'
  }, {
    id: 'algo',
    domain: '计算机系统',
    code: '6.006',
    institution: 'MIT',
    title: '算法导论',
    summary: '不是背模板，而是学会给一个做法算价钱。',
    noteCount: 24,
    conceptCount: 44,
    progress: '已整理 15 / 24'
  }, {
    id: 'game',
    domain: '经济学',
    code: 'ECON 159',
    institution: 'Yale',
    title: '博弈论',
    summary: '当结果取决于别人怎么选，理性本身就变成了一个结构问题。',
    noteCount: 16,
    conceptCount: 27,
    progress: '已整理 11 / 16'
  }];
  const NOTES = [{
    id: 'veil',
    course: '正义论导读',
    courseId: 'justice',
    lecture: '第 3 讲',
    title: '无知之幕',
    summary: '梳理这个思想装置的作用，以及它为什么不是论证的终点。',
    concepts: ['原初状态', '分配正义'],
    readingTime: '约 12 分钟',
    updated: '三天前更新'
  }, {
    id: 'nozick',
    course: '正义论导读',
    courseId: 'justice',
    lecture: '第 5 讲',
    title: '诺齐克的反驳',
    summary: '持有正义论如何把「分配」这个提法本身当成问题。',
    concepts: ['持有正义', '自我所有'],
    readingTime: '约 9 分钟',
    updated: '上周更新'
  }, {
    id: 'amort',
    course: '算法导论',
    courseId: 'algo',
    lecture: '第 7 讲',
    title: '摊还分析',
    summary: '一次昂贵的操作可以被很多次便宜的操作摊平——前提是你算得清。',
    concepts: ['势能法', '动态数组'],
    readingTime: '约 15 分钟',
    updated: '两天前更新'
  }, {
    id: 'nash',
    course: '博弈论',
    courseId: 'game',
    lecture: '第 4 讲',
    title: '纳什均衡为什么存在',
    summary: '不动点定理给了一个存在性答案，但没有给出如何到达。',
    concepts: ['不动点', '混合策略'],
    readingTime: '约 11 分钟',
    updated: '四天前更新'
  }, {
    id: 'liberty2',
    course: '自由的两种概念',
    courseId: 'liberty',
    lecture: '第 2 讲',
    title: '消极自由的边界',
    summary: '「不被干涉」听起来清楚，落到制度上却需要一整套前提。',
    concepts: ['消极自由', '干涉'],
    readingTime: '约 8 分钟',
    updated: '上月更新'
  }];
  const LECTURE_TOC = [{
    id: 'setup',
    label: '问题的设置',
    level: 2
  }, {
    id: 'veil',
    label: '无知之幕是什么',
    level: 3
  }, {
    id: 'orig',
    label: '原初状态里的人',
    level: 3
  }, {
    id: 'why',
    label: '为什么需要这层遮蔽',
    level: 2
  }, {
    id: 'crit',
    label: '两种反驳',
    level: 2
  }];
  const BACKLINKS = [{
    course: '正义论导读 · 第 5 讲',
    title: '诺齐克的反驳',
    context: '…他认为无知之幕本身已经预设了一种分配观。',
    href: '#'
  }, {
    course: '博弈论 · 第 9 讲',
    title: '不确定下的选择',
    context: '…把幕后的人当作一个极端风险厌恶的决策者来读。',
    href: '#'
  }, {
    course: '自由的两种概念 · 第 6 讲',
    title: '平等与自由的取舍',
    context: '…如果幕后没人知道自己的位置，自由与平等的冲突会推迟出现。',
    href: '#'
  }];
  const COURSE_LECTURES = [{
    value: 'l1',
    label: '第 1 讲 · 功利主义的诱惑',
    depth: 1
  }, {
    value: 'l2',
    label: '第 2 讲 · 契约论的复活',
    depth: 1
  }, {
    value: 'veil',
    label: '第 3 讲 · 无知之幕',
    depth: 1
  }, {
    value: 'l4',
    label: '第 4 讲 · 两个正义原则',
    depth: 1
  }, {
    value: 'nozick',
    label: '第 5 讲 · 诺齐克的反驳',
    depth: 1
  }, {
    value: 'l6',
    label: '第 6 讲 · 能力路径',
    depth: 1
  }];
  Object.assign(window, {
    DOMAINS,
    COURSES,
    NOTES,
    LECTURE_TOC,
    BACKLINKS,
    COURSE_LECTURES
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/archipelago-web/data.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.BacklinkList = __ds_scope.BacklinkList;

__ds_ns.ConceptLink = __ds_scope.ConceptLink;

__ds_ns.CourseCard = __ds_scope.CourseCard;

__ds_ns.DomainCard = __ds_scope.DomainCard;

__ds_ns.NoteCard = __ds_scope.NoteCard;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.SidebarNav = __ds_scope.SidebarNav;

__ds_ns.TableOfContents = __ds_scope.TableOfContents;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
