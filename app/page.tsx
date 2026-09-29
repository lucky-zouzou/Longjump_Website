import Storefront from '@/components/storefront';
import { getLiveProducts } from '@/lib/server-catalog';

export const dynamic = 'force-dynamic';
export default async function Home() { return <Storefront initialCatalog={await getLiveProducts()}/>; }
