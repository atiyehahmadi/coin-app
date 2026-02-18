/* eslint-disable prettier/prettier */
import { fetcher } from '@/lib/coingecko.actions';
import Image from 'next/image';
import Link from 'next/link';
import DataTable from '@/components/DataTable';
import CoinsPagination from '@/components/CoinsPagination';
import { ExternalLink, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

const ExchangesPage = async ({ searchParams }: NextPageProps) => {
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;
  const perPage = 15;

  let exchanges: Exchange[] = [];

  try {
    exchanges = await fetcher<Exchange[]>('/exchanges', {
      per_page: perPage,
      page: currentPage,
    });
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    return (
      <main id="exchanges-page">
        <div className="error-state">
          <p>Failed to load exchanges. Please try again later.</p>
        </div>
      </main>
    );
  }

  const getTrustIcon = (score: number) => {
    if (score >= 8) return <ShieldCheck className="text-green-500" size={18} />;
    if (score >= 5) return <Shield className="text-yellow-500" size={18} />;
    return <ShieldAlert className="text-red-500" size={18} />;
  };

  const columns: DataTableColumn<Exchange>[] = [
    {
      header: '#',
      cellClassName: 'rank-cell',
      cell: (exchange) => (
        <>
          {exchange.trust_score_rank}
          <Link
            href={exchange.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit exchange"
          />
        </>
      ),
    },
    {
      header: 'Exchange',
      cellClassName: 'exchange-cell',
      cell: (exchange) => (
        <div className="exchange-info">
          <Image
            src={exchange.image}
            alt={exchange.name}
            width={32}
            height={32}
            className="exchange-logo"
          />
          <div className="exchange-details">
            <p className="name">{exchange.name}</p>
            {exchange.country && <span className="country">{exchange.country}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Trust Score',
      cellClassName: 'trust-cell',
      cell: (exchange) => (
        <div className="trust-score">
          {getTrustIcon(exchange.trust_score)}
          <span>{exchange.trust_score}/10</span>
        </div>
      ),
    },
    {
      header: '24h Volume (BTC)',
      cellClassName: 'volume-cell',
      cell: (exchange) => {
        const vol = exchange.trade_volume_24h_btc;
        return <span>{vol != null ? `${vol.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC` : '-'}</span>;
      },
    },
    {
      header: 'Normalized Volume',
      cellClassName: 'normalized-cell',
      cell: (exchange) => {
        const norm = exchange.trade_volume_24h_btc_normalized;
        return <span>{norm != null ? `${norm.toLocaleString(undefined, { maximumFractionDigits: 0 })} BTC` : '-'}</span>;
      },
    },
    {
      header: 'Year',
      cellClassName: 'year-cell',
      cell: (exchange) => <span>{exchange.year_established || '-'}</span>,
    },
    {
      header: '',
      cellClassName: 'link-cell',
      cell: (exchange) => (
        <Link
          href={exchange.url}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link"
        >
          <ExternalLink size={16} />
        </Link>
      ),
    },
  ];

  const hasMorePages = exchanges.length === perPage;

  return (
    <main id="exchanges-page">
      <div className="content">
        <div className="page-header">
          <h1>Cryptocurrency Exchanges</h1>
          <p className="subtitle">Top exchanges ranked by trust score and trading volume</p>
        </div>

        <DataTable
          tableClassName="exchanges-table"
          columns={columns}
          data={exchanges}
          rowKey={(exchange) => exchange.id}
        />

        <CoinsPagination
          currentPage={currentPage}
          totalPages={currentPage >= 20 ? Math.ceil(currentPage / 20) * 20 + 20 : 20}
          hasMorePages={hasMorePages}
        />
      </div>
    </main>
  );
};

export default ExchangesPage;
