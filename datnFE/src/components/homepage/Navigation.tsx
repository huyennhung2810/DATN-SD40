import React, { useState, useEffect, useRef } from "react";
import {
  DownOutlined,
  RightOutlined,
  CloseOutlined,
  MenuOutlined,
  CameraOutlined,
  AimOutlined,
  ThunderboltOutlined,
  GiftOutlined,
  FireOutlined,
  VideoCameraOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { customerProductApi } from "../../api/customerProductApi";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NavCategory {
  id: string;
  code: string;
  name: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

// ─── Icon mapping (based on category name patterns) ───────────────────────────

const categoryIconMap: Record<string, React.ReactNode> = {
  "may-anh": <CameraOutlined />,
  "máy ảnh": <CameraOutlined />,
  "camera": <CameraOutlined />,
  "ong-kinh": <AimOutlined />,
  "ống kính": <AimOutlined />,
  "lens": <AimOutlined />,
  "may-quay": <VideoCameraOutlined />,
  "máy quay": <VideoCameraOutlined />,
  "gimbal": <ThunderboltOutlined />,
  "den-flash": <FireOutlined />,
  "đèn flash": <FireOutlined />,
  "flash": <FireOutlined />,
  "phu-kien": <GiftOutlined />,
  "phụ kiện": <GiftOutlined />,
  "accessories": <GiftOutlined />,
};

const getCategoryIcon = (name: string): React.ReactNode =>
  categoryIconMap[name.toLowerCase()] ?? <GiftOutlined />;

// ─── Static nav items (non-category links) ────────────────────────────────────

const staticNavItems: NavItem[] = [
  {
    id: "tin-tuc",
    label: "Tin tức",
    href: "/client/news",
  },
  {
    id: "lien-he",
    label: "Liên hệ",
    href: "/client/contact",
  },
];

// ─── Build navigation from flat category list ─────────────────────────────────

function buildNavItems(categories: NavCategory[]): NavItem[] {
  const canon = categories.filter(
    (c) => c.code === "may-anh" || c.name.toLowerCase().includes("máy ảnh"),
  );
  const lens = categories.filter(
    (c) => c.code === "ong-kinh" || c.name.toLowerCase().includes("ống kính"),
  );
  const flash = categories.filter(
    (c) =>
      c.code === "den-flash" ||
      c.name.toLowerCase().includes("đèn flash") ||
      c.name.toLowerCase().includes("flash"),
  );
  const accessory = categories.filter(
    (c) =>
      c.code === "phu-kien" ||
      c.name.toLowerCase().includes("phụ kiện") ||
      c.name.toLowerCase().includes("accessories"),
  );
  const others = categories.filter(
    (c) =>
      c.id !== canon[0]?.id &&
      c.id !== lens[0]?.id &&
      c.id !== flash[0]?.id &&
      c.id !== accessory[0]?.id,
  );

  const mapCat = (cat: NavCategory): NavItem => ({
    id: cat.id,
    label: cat.name,
    href: `/client/catalog?categoryId=${cat.id}`,
    icon: getCategoryIcon(cat.name),
  });

  const items: NavItem[] = [];

  if (canon.length) {
    const c = canon[0];
    items.push({
      id: c.id,
      label: "Máy ảnh Canon",
      href: `/client/catalog?brand=canon&categoryId=${c.id}`,
      icon: <CameraOutlined />,
      children: canon.map(mapCat),
    });
  }

  if (lens.length) {
    const c = lens[0];
    items.push({
      id: c.id,
      label: "Ống kính",
      href: `/client/catalog?categoryId=${c.id}`,
      icon: <AimOutlined />,
      children: lens.map(mapCat),
    });
  }

  if (flash.length) {
    const c = flash[0];
    items.push({
      id: c.id,
      label: "Đèn flash",
      href: `/client/catalog?categoryId=${c.id}`,
      icon: <FireOutlined />,
      children: flash.map(mapCat),
    });
  }

  if (accessory.length) {
    const c = accessory[0];
    items.push({
      id: c.id,
      label: "Phụ kiện",
      href: `/client/catalog?categoryId=${c.id}`,
      icon: <GiftOutlined />,
      children: accessory.map(mapCat),
    });
  }

  if (others.length) {
    items.push({
      id: "other",
      label: "Khác",
      href: `/client/catalog`,
      icon: <GiftOutlined />,
      children: others.map(mapCat),
    });
  }

  return items;
}

// ─── Sub-component: dropdown panel ────────────────────────────────────────────

interface DropdownPanelProps {
  item: NavItem;
  onClose: () => void;
}

const DropdownPanel: React.FC<DropdownPanelProps> = ({ item, onClose }) => {
  const navigate = useNavigate();

  if (!item.children?.length) return null;

  return (
    <div className="nav-dp">
      <div className="nav-dp-header">
        <span className="nav-dp-icon">{item.icon}</span>
        <span className="nav-dp-title">{item.label}</span>
      </div>
      <div className="nav-dp-items">
        {item.children.map((child) => (
          <button
            key={child.id}
            type="button"
            className="nav-dp-item"
            onClick={() => {
              navigate(child.href);
              onClose();
            }}
          >
            <span className="nav-dp-item-icon">{child.icon}</span>
            <span>{child.label}</span>
            <RightOutlined className="nav-dp-arrow" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Main Navigation component ───────────────────────────────────────────────

const Navigation: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<NavCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Desktop hover state
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Build nav items from fetched categories
  const navItems: NavItem[] = [
    ...buildNavItems(categories),
    ...staticNavItems,
  ];

  // ── Fetch categories from API ─────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await customerProductApi.getCategories();
        if (!cancelled && data.length > 0) {
          setCategories(data);
        }
      } catch {
        // silently keep empty list on failure
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Desktop hover handlers ────────────────────────────────────────────────

  const handleMouseEnter = (id: string) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredId(id);
  };

  const handleMouseLeave = () => {
    hoverTimerRef.current = setTimeout(() => setHoveredId(null), 160);
  };

  // ── Mobile accordion handlers ─────────────────────────────────────────────

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ── Render mobile nav ──────────────────────────────────────────────────────

  const renderMobileNav = () => (
    <div className={`nav-mobile ${mobileOpen ? "nav-mobile--open" : ""}`}>
      <div className="nav-mobile-header">
        <span className="nav-mobile-title">Danh mục sản phẩm</span>
        <button
          type="button"
          className="nav-mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Đóng menu"
        >
          <CloseOutlined />
        </button>
      </div>

      <div className="nav-mobile-body">
        {loading ? (
          <div className="nav-mobile-loading">
            <LoadingOutlined spin />
            <span>Đang tải danh mục…</span>
          </div>
        ) : (
          navItems.map((item) => {
            const isExpanded = expandedIds.has(item.id);
            const hasChildren = Boolean(item.children?.length);

            return (
              <div key={item.id} className="nav-mobile-section">
                <div className="nav-mobile-row">
                  {hasChildren ? (
                    <button
                      type="button"
                      className="nav-mobile-item nav-mobile-item--parent"
                      onClick={() => toggleExpand(item.id)}
                    >
                      <span className="nav-mobile-item-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="nav-mobile-item nav-mobile-item--leaf"
                      onClick={() => {
                        navigate(item.href);
                        setMobileOpen(false);
                      }}
                    >
                      <span className="nav-mobile-item-icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  )}

                  {hasChildren && (
                    <button
                      type="button"
                      className={`nav-mobile-expand ${isExpanded ? "nav-mobile-expand--open" : ""}`}
                      onClick={() => toggleExpand(item.id)}
                      aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                    >
                      <DownOutlined />
                    </button>
                  )}
                </div>

                {hasChildren && isExpanded && (
                  <div className="nav-mobile-children">
                    {item.children!.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        className="nav-mobile-child"
                        onClick={() => {
                          navigate(child.href);
                          setMobileOpen(false);
                        }}
                      >
                        <span className="nav-mobile-child-icon">{child.icon}</span>
                        <span>{child.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // ── Overlay ────────────────────────────────────────────────────────────────

  const renderOverlay = () => {
    if (!mobileOpen) return null;
    return (
      <div
        className="nav-overlay"
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <nav className="shop-nav" role="navigation" aria-label="Thanh điều hướng chính">
        <div className="shop-nav-inner">

          {/* ── Mobile hamburger ───────────────────────────────────────── */}
          <button
            type="button"
            className="nav-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
          >
            <MenuOutlined />
          </button>

          {/* ── Desktop nav items ──────────────────────────────────────── */}
          <div className="nav-links">
            {loading ? (
              <span className="nav-loading-hint">
                <LoadingOutlined spin />
              </span>
            ) : (
              navItems.map((item) => {
                const isHovered = hoveredId === item.id;
                const hasChildren = Boolean(item.children?.length);

                if (hasChildren) {
                  return (
                    <div
                      key={item.id}
                      className="nav-item-wrap"
                      onMouseEnter={() => handleMouseEnter(item.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        type="button"
                        className={`nav-item nav-item--has-children ${isHovered ? "nav-item--hovered" : ""}`}
                      >
                        <span>{item.label}</span>
                        <DownOutlined className="nav-chevron" />
                      </button>

                      {isHovered && (
                        <div className="nav-dropdown">
                          <DropdownPanel
                            item={item}
                            onClose={() => setHoveredId(null)}
                          />
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className="nav-item nav-item--link"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.href);
                    }}
                  >
                    {item.label}
                  </a>
                );
              })
            )}
          </div>

          {/* ── Hotline (desktop) ──────────────────────────────────────── */}
          <a href="tel:19001909" className="nav-hotline">
            <span className="nav-hotline-icon">☎</span>
            <span>1900 1909</span>
          </a>
        </div>

        {/* ── Mobile nav panel ──────────────────────────────────────────── */}
        {renderMobileNav()}
        {renderOverlay()}
      </nav>

      <style>{`
        /* ─── Base ──────────────────────────────────────────────────────────── */
        .shop-nav {
          background: #0a0a0a;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          position: sticky;
          top: 0;
          z-index: 200;
          font-family: inherit;
        }

        .shop-nav-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 0;
        }

        /* ─── Hamburger (mobile only) ──────────────────────────────────────── */
        .nav-hamburger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          cursor: pointer;
          flex-shrink: 0;
          margin-right: 8px;
        }

        .nav-hamburger:hover {
          color: #fff;
        }

        /* ─── Nav links ─────────────────────────────────────────────────────── */
        .nav-links {
          display: flex;
          align-items: center;
          flex: 1;
          gap: 2px;
        }

        .nav-loading-hint {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          padding: 12px 0;
        }

        /* ─── Nav item ─────────────────────────────────────────────────────── */
        .nav-item-wrap {
          position: relative;
        }

        .nav-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 13px 16px;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.88);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: color 0.2s, background 0.2s;
          border-radius: 2px;
          text-decoration: none;
          line-height: 1;
        }

        .nav-item:hover,
        .nav-item--hovered {
          color: #fff;
          background: rgba(255, 255, 255, 0.07);
        }

        .nav-item--link {
          /* anchor variant */
        }

        .nav-chevron {
          font-size: 9px;
          opacity: 0.7;
          transition: transform 0.2s;
        }

        .nav-item--hovered .nav-chevron {
          transform: rotate(180deg);
        }

        /* ─── Dropdown ─────────────────────────────────────────────────────── */
        .nav-dropdown {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          min-width: 240px;
          z-index: 300;
        }

        /* ─── Dropdown panel ───────────────────────────────────────────────── */
        .nav-dp {
          background: #fff;
          border-radius: 6px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .nav-dp-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px 12px;
          border-bottom: 1px solid #f0f0f0;
          background: #fafafa;
        }

        .nav-dp-icon {
          font-size: 18px;
          color: #c62828;
        }

        .nav-dp-title {
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: 0.02em;
        }

        .nav-dp-items {
          padding: 8px;
        }

        .nav-dp-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 14px;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          color: #444;
          text-align: left;
          transition: background 0.15s, color 0.15s;
        }

        .nav-dp-item:hover {
          background: #f5f5f5;
          color: #c62828;
        }

        .nav-dp-item-icon {
          font-size: 15px;
          color: #888;
          flex-shrink: 0;
        }

        .nav-dp-item:hover .nav-dp-item-icon {
          color: #c62828;
        }

        .nav-dp-arrow {
          margin-left: auto;
          font-size: 10px;
          color: #bbb;
          flex-shrink: 0;
        }

        .nav-dp-item:hover .nav-dp-arrow {
          color: #c62828;
        }

        /* ─── Hotline ──────────────────────────────────────────────────────── */
        .nav-hotline {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          margin-left: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          flex-shrink: 0;
          white-space: nowrap;
          transition: background 0.2s;
        }

        .nav-hotline:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .nav-hotline-icon {
          font-size: 14px;
        }

        /* ─── Mobile overlay ───────────────────────────────────────────────── */
        .nav-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: 210;
        }

        /* ─── Mobile panel ─────────────────────────────────────────────────── */
        .nav-mobile {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 300px;
          background: #fff;
          z-index: 220;
          flex-direction: column;
          transform: translateX(-100%);
          transition: transform 0.28s ease;
          overflow: hidden;
        }

        .nav-mobile--open {
          transform: translateX(0);
        }

        .nav-mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #1a1a1a;
          flex-shrink: 0;
        }

        .nav-mobile-title {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .nav-mobile-close {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          cursor: pointer;
          border-radius: 4px;
          transition: color 0.2s;
        }

        .nav-mobile-close:hover {
          color: #fff;
        }

        .nav-mobile-body {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }

        .nav-mobile-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 24px 20px;
          color: #666;
          font-size: 14px;
        }

        .nav-mobile-section {
          border-bottom: 1px solid #f0f0f0;
        }

        .nav-mobile-row {
          display: flex;
          align-items: center;
        }

        .nav-mobile-item {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          padding: 14px 20px;
          background: transparent;
          border: none;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }

        .nav-mobile-item--parent {
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .nav-mobile-item--leaf {
          /* leaf styling */
        }

        .nav-mobile-item-icon {
          font-size: 16px;
          color: #888;
          flex-shrink: 0;
        }

        .nav-mobile-expand {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #888;
          font-size: 12px;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.2s, color 0.15s;
        }

        .nav-mobile-expand--open {
          transform: rotate(180deg);
          color: #c62828;
        }

        .nav-mobile-children {
          background: #fafafa;
          padding: 4px 0 8px;
        }

        .nav-mobile-child {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 20px 10px 40px;
          background: transparent;
          border: none;
          font-family: inherit;
          font-size: 13px;
          color: #555;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s, color 0.15s;
        }

        .nav-mobile-child:hover {
          background: #f0f0f0;
          color: #c62828;
        }

        .nav-mobile-child-icon {
          font-size: 14px;
          color: #aaa;
          flex-shrink: 0;
        }

        .nav-mobile-child:hover .nav-mobile-child-icon {
          color: #c62828;
        }

        /* ─── Responsive ────────────────────────────────────────────────────── */
        @media (max-width: 1023px) {
          .shop-nav {
            position: relative;
          }

          .nav-hamburger {
            display: flex;
          }

          .nav-links {
            display: none;
          }

          .nav-hotline {
            display: none;
          }

          .nav-overlay {
            display: block;
          }

          .nav-mobile {
            display: flex;
          }
        }

        @media (max-width: 480px) {
          .nav-mobile {
            width: 85vw;
          }
        }
      `}</style>
    </>
  );
};

export default Navigation;
