import React from "react";
import { Row, Col } from "antd";
import { CalendarOutlined, RightOutlined } from "@ant-design/icons";

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
}

const BlogPreview: React.FC = () => {
  const articles: BlogArticle[] = [
    {
      id: "1",
      title: "So sánh Sony A7 IV vs Canon EOS R6: Máy nào tốt hơn?",
      excerpt: "Chúng tôi đã thử nghiệm chi tiết hai flagship mirrorless full-frame để tìm ra người chiến thắng...",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
      date: "15/03/2024",
      category: "Đánh giá"
    },
    {
      id: "2",
      title: "Hướng dẫn chọn ống kính cho người mới bắt đầu",
      excerpt: "Tìm hiểu cách chọn ống kính phù hợp với nhu cầu và ngân sách của bạn...",
      image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80",
      date: "12/03/2024",
      category: "Hướng dẫn"
    },
    {
      id: "3",
      title: "Top 5 gimbal tốt nhất 2024 cho người quay phim",
      excerpt: "Tổng hợp những gimbal ổn định nhất giúp bạn tạo ra những thước phim mượt mà...",
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
      date: "10/03/2024",
      category: "Tin tức"
    }
  ];

  return (
    <section className="blog-preview">
      <div className="section-container">
        <div className="section-header">
          <div className="header-left">
            <h2 className="section-title">Tin tức & Blog</h2>
            <p className="section-subtitle">Cập nhật những tin tức mới nhất</p>
          </div>
          <a href="/client/news" className="view-all-link">
            Xem tất cả <RightOutlined />
          </a>
        </div>
        <Row gutter={[24, 24]}>
          {articles.map((article) => (
            <Col xs={24} sm={12} lg={8} key={article.id}>
              <article className="blog-card">
                <div className="blog-image-wrapper">
                  <img src={article.image} alt={article.title} className="blog-image" />
                  <span className="blog-category">{article.category}</span>
                </div>
                <div className="blog-content">
                  <div className="blog-meta">
                    <CalendarOutlined />
                    <span>{article.date}</span>
                  </div>
                  <h3 className="blog-title">{article.title}</h3>
                  <p className="blog-excerpt">{article.excerpt}</p>
                  <a href={`/client/news/${article.id}`} className="blog-link">
                    Đọc tiếp <RightOutlined />
                  </a>
                </div>
              </article>
            </Col>
          ))}
        </Row>
      </div>

      <style>{`
        .blog-preview {
          background: #f8f9fa;
          padding: 60px 0;
        }

        .section-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e5e5;
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .section-title {
          font-size: 28px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
        }

        .section-subtitle {
          font-size: 15px;
          color: #666;
          margin: 0;
        }

        .view-all-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #D32F2F;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }

        .view-all-link:hover {
          gap: 10px;
        }

        .blog-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid #f0f0f0;
        }

        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
        }

        .blog-image-wrapper {
          position: relative;
          aspect-ratio: 16/10;
          overflow: hidden;
        }

        .blog-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .blog-card:hover .blog-image {
          transform: scale(1.05);
        }

        .blog-category {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 12px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          border-radius: 6px;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .blog-content {
          padding: 20px;
        }

        .blog-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #999;
          font-size: 12px;
          margin-bottom: 10px;
        }

        .blog-title {
          font-size: 16px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 10px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .blog-excerpt {
          font-size: 14px;
          color: #666;
          margin: 0 0 16px;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .blog-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #D32F2F;
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
          transition: all 0.2s;
        }

        .blog-link:hover {
          gap: 10px;
        }

        @media (max-width: 768px) {
          .blog-preview {
            padding: 40px 0;
          }

          .section-container {
            padding: 0 16px;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .section-title {
            font-size: 22px;
          }
        }
      `}</style>
    </section>
  );
};

export default BlogPreview;
