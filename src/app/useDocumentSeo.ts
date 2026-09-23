import { useEffect } from "react";
import { site } from "@/legal/site";

export interface DocumentSeo {
  /** <title> 전체 값. 화면마다 달라야 한다 */
  title: string;
  /** meta description. 화면마다 달라야 한다 */
  description: string;
  /** site.url 뒤에 붙일 경로. 반드시 "/" 로 시작한다 */
  path: string;
  /** 검색 결과에 넣을 이유가 없는 화면(설정·중간 단계 등)은 true */
  noIndex?: boolean;
}

/** name= 으로 찾는 meta 를 갱신한다. 없으면 만든다 */
function setMetaByName(name: string, content: string | null) {
  const existing = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (content === null) {
    existing?.remove();
    return;
  }
  const el = existing ?? document.head.appendChild(document.createElement("meta"));
  el.setAttribute("name", name);
  el.setAttribute("content", content);
}

/** property= 으로 찾는 OG meta 를 갱신한다 */
function setMetaByProperty(property: string, content: string) {
  const existing = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  const el = existing ?? document.head.appendChild(document.createElement("meta"));
  el.setAttribute("property", property);
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  const existing = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const el = existing ?? document.head.appendChild(document.createElement("link"));
  el.setAttribute("rel", "canonical");
  el.setAttribute("href", href);
}

/**
 * 화면별 title·description·canonical 을 문서에 반영한다.
 *
 * index.html 은 한 벌뿐이라 SPA 의 모든 경로가 같은 head 를 받는다.
 * 그대로 두면 /privacy, /terms, /rules/2026 의 canonical 이 전부 "/" 를 가리켜
 * 검색엔진이 홈의 사본으로 보고 색인에서 뺀다.
 *
 * 한계: 이건 JS 실행 후에 바뀌는 값이라, HTML 에 처음부터 박혀 있는 것보다 약하다.
 * TODO(seo): 근본 해결은 빌드 타임 프리렌더. 연봉 구간별 정적 페이지를 만들 때 같이 검토한다.
 */
export function useDocumentSeo({ title, description, path, noIndex = false }: DocumentSeo) {
  useEffect(() => {
    const url = `${site.url}${path}`;

    document.title = title;
    setMetaByName("description", description);
    setCanonical(url);

    setMetaByProperty("og:title", title);
    setMetaByProperty("og:description", description);
    setMetaByProperty("og:url", url);

    setMetaByName("twitter:title", title);
    setMetaByName("twitter:description", description);

    setMetaByName("robots", noIndex ? "noindex, follow" : null);
  }, [title, description, path, noIndex]);
}
