
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

type CountryData = {
  code: string;
  name: string;
  amt: number;
  region: string;
};

interface WorldMapProps {
  countries: CountryData[];
}

// 지역별 색상표
const REGION_COLORS = {
  '미주': '#4169E1', // 로열 블루
  '구주': '#6A5ACD'  // 슬레이트 블루
};

const WorldMap = ({ countries }: WorldMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mapContainerRef.current || !countries.length) return;
    
    // 모듈 동적 로딩
    import('d3').then((d3) => {
      import('topojson-client').then((topojson) => {
        drawMap(d3, topojson);
      });
    });
    
    const drawMap = async (d3: any, topojson: any) => {
      // 기존 SVG 클리어
      d3.select(mapContainerRef.current).select('svg').remove();
      
      // 지도 크기 설정
      const width = mapContainerRef.current.clientWidth;
      const height = mapContainerRef.current.clientHeight;
      
      // SVG 생성
      const svg = d3.select(mapContainerRef.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .attr('style', 'max-width: 100%; height: auto;');
        
      // 투영법 설정
      const projection = d3.geoNaturalEarth1()
        .scale(width / 6)
        .translate([width / 2, height / 2]);
        
      // 경로 생성기
      const path = d3.geoPath().projection(projection);
      
      // 데이터 로드 및 시각화
      try {
        // 월드맵 데이터 가져오기
        const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        
        // 국가 경계 그리기
        const countries = topojson.feature(world, world.objects.countries);
        const countriesMesh = topojson.mesh(world, world.objects.countries);
        
        // 매출 데이터 기반 색상 스케일 생성
        const countryDataMap = new Map();
        const maxAmt = Math.max(...countries.map(c => c.amt || 0));
        
        // 국가 데이터 맵 생성
        countries.forEach(country => {
          const countryCode = country.id;
          const data = countries.find(c => c.code === countryCode);
          if (data) {
            countryDataMap.set(countryCode, data);
          }
        });
        
        // 색상 스케일 설정
        const colorScale = d3.scaleSequential()
          .domain([0, maxAmt])
          .interpolator(d3.interpolateBlues);
          
        // 지도 배경
        svg.append('path')
          .datum({ type: 'Sphere' })
          .attr('fill', '#f8fafc')
          .attr('stroke', '#cbd5e1')
          .attr('d', path);
        
        // 국가들 그리기
        svg.append('g')
          .selectAll('path')
          .data(countries.features)
          .join('path')
          .attr('fill', d => {
            const countryData = countryDataMap.get(d.id);
            if (countryData) {
              return colorScale(countryData.amt);
            }
            return '#e2e8f0'; // 데이터 없는 국가
          })
          .attr('d', path)
          .attr('stroke', '#cbd5e1')
          .attr('stroke-width', 0.3)
          .append('title')
          .text(d => {
            const countryData = countryDataMap.get(d.id);
            if (countryData) {
              return `${countryData.name}: ${countryData.amt.toLocaleString()} 만원`;
            }
            return d.properties.name;
          });
          
        // 하이라이트된 국가들 (데이터가 있는 국가)
        svg.append('g')
          .selectAll('path')
          .data(countries)
          .join('path')
          .attr('fill', d => {
            const region = d.region;
            const opacity = Math.min(0.8, 0.3 + (d.amt / maxAmt * 0.7));
            return d3.color(REGION_COLORS[region])?.copy({ opacity })?.toString() || '#e2e8f0';
          })
          .attr('d', d => {
            const feature = countries.features.find(f => f.id === d.code);
            return feature ? path(feature) : null;
          })
          .attr('stroke', d => REGION_COLORS[d.region])
          .attr('stroke-width', 0.5)
          .on('mouseover', function(event, d) {
            d3.select(this)
              .attr('stroke-width', 1.5);
              
            // 툴팁 표시
            const [x, y] = d3.pointer(event);
            
            const tooltip = svg.append('g')
              .attr('class', 'tooltip')
              .attr('transform', `translate(${x + 10}, ${y - 10})`);
              
            tooltip.append('rect')
              .attr('width', 150)
              .attr('height', 60)
              .attr('fill', 'white')
              .attr('stroke', '#ccc')
              .attr('rx', 5)
              .attr('ry', 5)
              .attr('opacity', 0.9);
              
            tooltip.append('text')
              .attr('x', 10)
              .attr('y', 20)
              .text(d.name)
              .attr('font-weight', 'bold');
              
            tooltip.append('text')
              .attr('x', 10)
              .attr('y', 40)
              .text(`지역: ${d.region}`);
              
            tooltip.append('text')
              .attr('x', 10)
              .attr('y', 55)
              .text(`매출: ${d.amt.toLocaleString()} 만원`);
          })
          .on('mouseout', function() {
            d3.select(this)
              .attr('stroke-width', 0.5);
              
            svg.select('.tooltip').remove();
          });
          
        // 국가 경계선 그리기
        svg.append('path')
          .datum(countriesMesh)
          .attr('fill', 'none')
          .attr('stroke', 'white')
          .attr('stroke-width', 0.3)
          .attr('d', path);
          
      } catch (error) {
        console.error('지도 데이터 로딩 오류:', error);
        
        // 오류 메시지 표시
        svg.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .text('지도 데이터를 불러오는데 실패했습니다.');
      }
    };
    
    // 화면 크기 변경 시 지도 재렌더링
    const handleResize = () => {
      import('d3').then((d3) => {
        import('topojson-client').then((topojson) => {
          drawMap(d3, topojson);
        });
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [countries]);

  return (
    <div className="relative">
      {countries.length === 0 ? (
        <Card className="flex items-center justify-center h-full min-h-[300px]">
          <p className="text-muted-foreground">데이터를 불러오는 중입니다...</p>
        </Card>
      ) : (
        <div 
          ref={mapContainerRef} 
          className="w-full h-full min-h-[300px] rounded-md overflow-hidden"
        />
      )}
      <div className="absolute bottom-4 right-4 bg-white/80 p-2 rounded-md shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 inline-block" style={{ backgroundColor: REGION_COLORS['미주'] }}></span>
          <span>미주 지역</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 inline-block" style={{ backgroundColor: REGION_COLORS['구주'] }}></span>
          <span>구주 지역</span>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
